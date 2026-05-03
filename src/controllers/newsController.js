import pool from '../config/db.js'

export const getAllPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = 6

  const offset = (page - 1) * limit

  try {
    const postsResult = await pool.query(
      `
      SELECT * FROM posts
      ORDER BY published_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    )

    const countResult = await pool.query(`SELECT COUNT(*) FROM posts`)

    const totalItems = parseInt(countResult.rows[0].count)
    const totalPages = Math.ceil(totalItems / limit)

    res.json({
      news: postsResult.rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch posts',
    })
  }
}

export const getPostById = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(`SELECT * FROM posts WHERE id = $1`, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Post not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to fetch post',
    })
  }
}

export const createPost = async (req, res) => {
  const { title, content, link, image_url, source } = req.body

  try {
    const result = await pool.query(
      `
      INSERT INTO posts (title, content, link, image_url, source)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [title, content, link, image_url, source],
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to create post',
    })
  }
}

export const updatePost = async (req, res) => {
  const { id } = req.params
  const { title, content, link, image_url, source } = req.body

  try {
    const result = await pool.query(
      `
      UPDATE posts
      SET title = COALESCE($1, title),
          content = COALESCE($2, content),
          link = COALESCE($3, link),
          image_url = COALESCE($4, image_url),
          source = COALESCE($5, source),
          updated_at = NOW()
      WHERE id = $6
      RETURNING *
      `,
      [title, content, link, image_url, source, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Post not found',
      })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to update post',
    })
  }
}

export const deletePost = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `DELETE FROM posts WHERE id = $1 RETURNING *`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Post not found',
      })
    }

    res.json({
      message: 'Post deleted successfully',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Failed to delete post',
    })
  }
}
