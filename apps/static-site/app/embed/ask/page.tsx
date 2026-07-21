"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export default function Page() {
  const [text, setText] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    if (typeof window === "undefined" || !window.parent) return;
    window.parent.postMessage(
      { type: "fairway-ai:input", text: trimmed },
      window.location.origin
    );
    setText("");
  }

  return (
    <main className="embed-ask-body">
      <h1>Ask Fairway AI</h1>
      <p>Type a question and it will appear in the assistant on the parent page.</p>
      <form className="embed-ask-form" onSubmit={handleSubmit}>
        <input
          aria-label="Ask Fairway AI"
          onChange={(event) => setText(event.target.value)}
          placeholder="e.g. Compare forgiving irons"
          type="text"
          value={text}
        />
        <button disabled={!text.trim()} type="submit">
          Send
        </button>
      </form>
    </main>
  );
}
