// Questions.js
export const QUESTIONS = [
  {
    id: 1,
    title: "Simple Greeting",
    description: "Write a program that prints 'Hello Code Arena' (Case sensitive).",
    testCases: [
      {
        input: "", // No input needed for this simple one
        output: "Hello Code Arena",
      },
    ],
  },
  {
    id: 2,
    title: "Math Genius",
    description: "Print the sum of 100 + 200.",
    testCases: [
      {
        input: "",
        output: "300",
      },
    ],
  },
  {
    id: 3,
    title: "Python Master",
    description: "Print 'Python is King' using Python print function.",
    testCases: [
      {
        input: "",
        output: "Python is King",
      },
    ],
  },
];

export const getRandomQuestion = () => {
  const randomIndex = Math.floor(Math.random() * QUESTIONS.length);
  return QUESTIONS[randomIndex];
};