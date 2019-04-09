const crypto = require('crypto');
const path = require('path');

// Remove trailing slash
exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions;

  return new Promise((resolve, reject) => {
    // Remove trailing slash
    const newPage = Object.assign({}, page, {
      path: page.path === `/` ? page.path : page.path.replace(/\/$/, ``),
    });

    if (newPage.path !== page.path) {
      // Remove the old page
      deletePage(page);
      // Add the new page
      createPage(newPage);
    }

    resolve();
  });
};

let index = 0;

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions;

  if (node.internal.type === 'MarkdownRemark' || node.internal.type === 'Slide') {
    createNodeField({
      node,
      name: 'index',
      value: index,
    });

    index = index + 1;
  }
};

exports.createPages = ({ actions, createNodeId, graphql }) => {
  const { createNode, createPage } = actions;

  return graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            fileAbsolutePath
            html
            fields {
              index
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors);
    }

    const slides = sortSlides(getSlides(result));

    const slides2 = slides.flatMap(slide =>
      slide.node.html.split('<hr>').map(html => ({ node: slide.node, html })),
    );

    slides2.forEach(({ node, html }, index) => {
      const digest = crypto
        .createHash(`md5`)
        .update(html)
        .digest(`hex`);

      createNode({
        id: createNodeId(`${node.id}_${index} >>> Slide`),
        parent: node.id,
        children: [],
        internal: {
          type: `Slide`,
          contentDigest: digest,
        },
        html: html,
        index: index,
      });
    })

    slides2.forEach((slide, index) => {
      createPage({
        path: `/${index}`,
        component: path.resolve(`src/templates/slide.js`),
        context: {
          index,
        },
      });
    });
  });
};

function getSlides(result) {
  return result.data.allMarkdownRemark.edges;
}

function sortSlides(slides) {
  return [...slides].sort((slideA, slideB) =>
    slideA.node.fileAbsolutePath > slideB.node.fileAbsolutePath ? 1 : -1,
  );
}

function addIndexToSlides(slides) {
  return slides.map((slide, index) => ({
    ...slide,
    index,
  }));
}
