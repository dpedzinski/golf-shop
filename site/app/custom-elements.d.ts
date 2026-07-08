import type { ReactNode } from "react";

declare namespace JSX {
  interface IntrinsicElements {
    "df-messenger": {
      "project-id": string;
      location: string;
      "agent-id": string;
      "language-code": string;
      "oauth-client-id"?: string;
      children?: ReactNode;
    };
    "df-messenger-chat-bubble": {
      "chat-title": string;
    };
  }
}
