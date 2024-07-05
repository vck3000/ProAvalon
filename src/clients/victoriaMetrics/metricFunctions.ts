export function generateLabelCombinations(
  labelOptions?: Record<string, Set<string>>,
): Record<string, string>[] {
  let labelCombinations: Record<string, string>[] = [{}];

  Object.keys(labelOptions).forEach((labelName) => {
    // Get current label options
    const options = Array.from(labelOptions[labelName]);

    // Update combinations with new options
    labelCombinations = labelCombinations.flatMap((combination) =>
      options.map((option) => ({
        ...combination,
        [labelName]: option,
      })),
    );
  });

  return labelCombinations;
}
