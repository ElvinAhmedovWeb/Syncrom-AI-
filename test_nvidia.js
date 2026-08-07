const key = "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";

async function run() {
  const body = {
    model: "meta/llama-3.1-70b-instruct",
    messages: [
      { role: "user", content: "What is 2+2?" }
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "execute_code",
          description: "Execute JS code",
          parameters: {
            type: "object",
            properties: { code: { type: "string" } },
            required: ["code"],
          }
        }
      }
    ]
  };

  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  console.log(res.status, text);
}

run();
