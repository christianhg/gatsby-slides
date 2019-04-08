import { graphql } from 'gatsby';
import React from 'react';

export default ({ data }) => {
  const html = data.markdownRemark.html;

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export const query = graphql`
  query SlideByIndex($index: Int!) {
    markdownRemark(fields: { index: { eq: $index } }) {
      html
    }
  }
`;
