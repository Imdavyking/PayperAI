// export const callLLMApi = async ({ task }: { task: string }) => {
//   const response = await fetch(`${SERVER_URL}/api/llm`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${localStorage.getItem("token")}`,
//     },
//     body: JSON.stringify({ task }),
//   });
//   if (!response.ok) {
//     throw new Error("Failed to fetch llm response");
//   }
//   return await response.json();
// };
