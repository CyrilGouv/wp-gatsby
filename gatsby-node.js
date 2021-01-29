const path = require(`path`)
const { slash } = require(`gatsby-core-utils`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions

  createRedirect({ fromPath: '/', toPath: '/home', redirectInBrowser: true, isPermanent: true })

  const result = await graphql(`
    {
      allWordpressPage {
        edges {
          node {
            id
            slug
            status
            template
            title
            content
            template
          }
        }
      }
      allWordpressWpPortfolio {
          edges {
              node {
                  id
                  slug
                  title
                  content
                  excerpt
                  featured_media {
                      source_url
                  }
                  acf {
                    portfolio_url
                  }
              }
          }
      }
      allWordpressPost {
        edges {
          node {
            slug
            title
            content
            excerpt
            wordpress_id
            date(formatString: "Do MMM YYYY HH:mm")
          }
        }
      }
    }
  `)

  // Check for any errors
  if (result.errors) {
    throw new Error(result.errors)
  }

  // Access query results via object destructuring
  const { allWordpressPage, allWordpressWpPortfolio, allWordpressPost } = result.data

  // Create Page pages.
  const pageTemplate = path.resolve(`./src/templates/page.js`)
  const portfolioUnderContentTemplate = path.resolve(`./src/templates/portfolioUnderContent.js`)
  allWordpressPage.edges.forEach(edge => {
    createPage({
      path: `/${edge.node.slug}/`,
      component: slash(edge.node.template === 'portfolio-under-content.php' ? portfolioUnderContentTemplate : pageTemplate),
      context: edge.node,
    })
  })

  // Create Portfolio.
  const portfolioTemplate = path.resolve(`./src/templates/portfolio.js`)
  allWordpressWpPortfolio.edges.forEach(edge => {
    createPage({
      path: `/portfolio/${edge.node.slug}/`,
      component: slash(portfolioTemplate),
      context: edge.node,
    })
  })

  // Create Blog
  const blogPostListTemplate = path.resolve(`./src/templates/blogPostList.js`)
  const posts = allWordpressPost.edges
  const postsPerPage = 2
  const numberOfPages = Math.ceil(posts.length / postsPerPage)

  Array.from({ length: numberOfPages }).forEach((page, index) => {
    createPage({
      path: index === 0 ? '/blog' : `/blog/${index + 1}`,
      component: slash(blogPostListTemplate),
      context: {
        posts: posts.slice(index * postsPerPage, (index * postsPerPage) + postsPerPage),
        numberOfPages,
        currentPage: index + 1
      }
    })
  })

  // Create single post page.
  const postTemplate = path.resolve(`./src/templates/page.js`)
  allWordpressPost.edges.forEach(edge => {
    createPage({
      path: `/post/${edge.node.slug}/`,
      component: slash(postTemplate),
      context: edge.node,
    })
  })
}