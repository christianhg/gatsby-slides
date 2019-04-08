const path = require('path');

let index = 0;

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions;

  if (node.internal.type === 'MarkdownRemark') {
    createNodeField({
      node,
      name: 'index',
      value: index,
    });

    index = index + 1;
  }
};

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

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

    const slides = addIndexToSlides(sortSlides(getSlides(result)));

    slides.forEach(({ index }) => {
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
