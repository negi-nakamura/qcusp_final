  import bcrypt from 'bcryptjs'
  import {generateAccessToken, generateRefreshToken, verifyRefreshToken} from './../config/jwt.js'
  import pool from '../config/db.js'
  import { User } from '../models/userModel.js'
  import axios from 'axios'
  import dotenv from 'dotenv'

  dotenv.config()

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  }

  export async function register(req, res) {
    try {
      const { student_id, admin_id, password } = req.body

      if (!password || (!student_id && !admin_id)) {
      return res.status(400).json({ message: 'Missing required fields' })
      }

      if (student_id && admin_id) {
      return res.status(400).json({ message: 'Provide only one identifier' })
      }

      const existingUser = await User.findByIdentifier({student_id, admin_id})

      if (existingUser){
          return res.status(400).json({ message: 'User already exists' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = await User.create({ student_id, admin_id, password: hashedPassword })

      const response = {
        id: newUser.id,
        ...(newUser.student_id ? { student_id: newUser.student_id } : { admin_id: newUser.admin_id }),
        role: newUser.role,
        created_at: newUser.created_at
      }

      res.status(201).json({ message: 'User registered successfully', user: response })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server error' })
    }
  }


  export async function login(req, res) {
    try {
      const { student_id, admin_id, password } = req.body

      if (!password || (!student_id && !admin_id)) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      if (student_id && admin_id) {
        return res.status(400).json({ message: 'Provide only one identifier' })
      }

      const user = await User.findByIdentifier({ student_id, admin_id })
      
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' })
      }

      const validPassword = await bcrypt.compare(password, user.password_hash)

      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid credentials' })
      }

      const ip = req.ip?.replace('::ffff:', '') || null
      const userAgent = req.headers['user-agent']
      let country = null, region = null, city = null;

      if (ip && ip !== "127.0.0.1") {
        try {
          const geoRes = await axios.get(`http://ip-api.com/json/${ip}`);
          if (geoRes.data.status === "success") {
            country = geoRes.data.country;
            region = geoRes.data.regionName;
            city = geoRes.data.city;
          }
        } catch (err) {
          console.warn("IP lookup failed:", err.message);
        }
      }

      const existingSession = await pool.query(
        `SELECT id FROM sessions
        WHERE user_id = $1
          AND ip_address = $2
          AND user_agent = $3
          AND is_active = TRUE`,
        [user.id, ip, userAgent]
      );

      let sessionId;

    if (existingSession.rows.length > 0) {
        sessionId = existingSession.rows[0].id;
        await pool.query(
            `UPDATE sessions
              SET last_access = NOW(), country = $2, region = $3, city = $4
              WHERE id = $1`,
            [sessionId, country, region, city]
        );
    } else {
        const newSession = await pool.query(
          `INSERT INTO sessions (user_id, ip_address, user_agent, country, region, city, login_at, last_access) 
          VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())
          RETURNING id`,
          [user.id, ip, userAgent, country, region, city]
        );
        sessionId = newSession.rows[0].id;
      }

      const accessToken = generateAccessToken({ id: user.id, session_id: sessionId })
      const refreshToken = generateRefreshToken({ id: user.id, session_id: sessionId })

      res.cookie("refresh_token", refreshToken, cookieOptions);

      res.json({
        message: "Login successful",
        access_token: accessToken,
        user: {
          id: user.id,
          session_id: sessionId,
          role: user.role
        },
      });

    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server error' })
    }
  }

  export async function refresh(req, res) {
    try {
      const refreshToken = req.cookies.refresh_token
  
      if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' })
      }
  
      const decoded = verifyRefreshToken(refreshToken)
  
      if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' })
      }
  
      const sessionCheck = await pool.query(
        `SELECT id FROM sessions WHERE id = $1 AND user_id = $2 AND is_active = TRUE`,
        [decoded.session_id, decoded.id]
      )
  
      if (sessionCheck.rows.length === 0) {
        return res.status(401).json({ message: 'Session expired or invalid' })
      }
  
      await pool.query(
        `UPDATE sessions SET last_access = NOW() WHERE id = $1`,
        [decoded.session_id]
      )
  
      const accessToken = generateAccessToken({ 
        id: decoded.id, 
        session_id: decoded.session_id 
      })
  
      res.json({
        message: 'Token refreshed successfully',
        access_token: accessToken
      })
  
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server error' })
    }
  }

  export async function logout(req, res) {
    try {
      const refreshToken = req.cookies.refresh_token
  
      if (!refreshToken) {
        return res.status(400).json({ message: 'No active session found' })
      }
  
      const decoded = verifyRefreshToken(refreshToken)
  
      if (decoded) {
        await pool.query(
          `UPDATE sessions 
          SET is_active = FALSE, logout_at = NOW() 
          WHERE id = $1 AND user_id = $2`,
          [decoded.session_id, decoded.id]
        )
      }
  
      res.clearCookie('refresh_token', cookieOptions)
  
      res.json({ message: 'Logout successfully' })
  
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server error' })
    }
  }

  export async function me(req, res) {
    try {
      const { id: userId, session_id } = req.user

      if (session_id) {
        await pool.query(
          `UPDATE sessions 
          SET last_access = NOW() 
          WHERE id = $1 AND user_id = $2 AND is_active = TRUE`,
          [session_id, userId]
        )
      }

      const result = await pool.query(
        `SELECT id, student_id, admin_id, role, created_at
        FROM users
        WHERE id = $1`,
        [userId]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' })
      }

      const user = result.rows[0]

      res.json({
        user: {
          id: user.id,
          ...(user.student_id
            ? { student_id: user.student_id }
            : { admin_id: user.admin_id }),
          role: user.role,
          session_id,
          created_at: user.created_at,
        }
      })

    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server error' })
    }
  }