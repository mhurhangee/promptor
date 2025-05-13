// Helper: Get a random item from an array
export function getRandomItem(array: string[]): string {
  return array[Math.floor(Math.random() * array.length)]
}

// Helper: Get a random subset of items from an array
export function getRandomItems(array: string[], count: number): string[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
