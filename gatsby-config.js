module.exports = {
  siteMetadata: {
    title: 'Designing for Error',
    author: '@christianhg',
    data: 'April 12, 2019',
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/slides`,
        name: 'slides',
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
    },
  ],
};
