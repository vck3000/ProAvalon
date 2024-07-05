export function validateLabelNamesAndOptions(
  labelNames: string[],
  labelOptions: Record<string, string[]>,
) {
  const labelNamesFromOptions = Object.keys(labelOptions);
  const invalidLabelNamesFromOptions = labelNamesFromOptions.filter(
    (labelName) => !labelNames.includes(labelName),
  );

  if (invalidLabelNamesFromOptions.length > 0) {
    throw new Error(
      `Error: Undeclared labelNames: "${invalidLabelNamesFromOptions}".`,
    );
  }

  const invalidLabelNames = labelNames.filter(
    (labelName) => !labelNamesFromOptions.includes(labelName),
  );
  if (invalidLabelNames.length > 0) {
    throw new Error(
      `Error: labelOptions are not configured for labelNames="${invalidLabelNames}".`,
    );
  }
}

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
