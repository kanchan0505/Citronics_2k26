import { dbAny } from 'src/lib/database'

/**
 * Media Service — Citronics
 *
 * Handles all queries for page media and gallery content.
 *
 * Naming convention:
 *   getMedia*() → list queries (dbAny)
 */
const mediaService = {
  /**
   * Fetch media entries for a given page, with optional post filter.
   *
   * @param {string} page - The page name (e.g., 'gallery', 'team', 'about-citronics')
   * @param {string} [post] - Optional filter by post type (e.g., 'flash-mob', 'president')
   *
   * @returns {Promise<Array>} array of { id, page, name, post, description, links }
   */
  async getMediaByPage(page, post) {
    if (post && typeof post === 'string') {
      // Filter by post type
      return dbAny(
        'SELECT id, page, name, post, description, links FROM page_media WHERE page = $1 AND post = $2 ORDER BY id ASC',
        [page, post]
      )
    } else {
      // Get all media for this page
      return dbAny(
        'SELECT id, page, name, post, description, links FROM page_media WHERE page = $1 ORDER BY id ASC',
        [page]
      )
    }
  }
}

export default mediaService
