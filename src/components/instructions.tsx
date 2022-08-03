import React from "react";
import ReactMarkdown from "react-markdown";

const source = `
# Kaltura Player V7 - Demo

The project shows how to integrate Kaltura Player v7 into the React application.

## Technology Stack:
- React
- Rxjs for async updates
- aphrodite for styling - feel free to remove and use your preferred css-in-jss implementation

Please refer to file \`src/README.md\` for further information and setup guide
`;

export const Instructions = () => {
  return (
    <div className={"instructions"}>
      <ReactMarkdown source={source} />
    </div>
  );
};
