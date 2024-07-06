export function generateLabelCombinations(
  labelOptions: Record<string, Set<string>>,
): Record<string, string>[] {
  const labelNames = Object.keys(labelOptions);
  const labelCombinations: Record<string, string>[] = [];

  function buildCombinations(
    currentCombination: Record<string, string>,
    index: number,
  ) {
    if (index === labelNames.length) {
      labelCombinations.push(currentCombination);
      return;
    }

    const key = labelNames[index];
    const options = Array.from(labelOptions[key]);

    options.forEach((option) => {
      buildCombinations({ ...currentCombination, [key]: option }, index + 1);
    });
  }

  buildCombinations({}, 0);

  return labelCombinations;

  // TODO-kev: Use above recursive solution or below compact one
  // Object.keys(labelOptions).forEach((labelName) => {
  //   // Get current label options
  //   const options = Array.from(labelOptions[labelName]);
  //
  //   // Update combinations with new options
  //   labelCombinations = labelCombinations.flatMap((combination) =>
  //     options.map((option) => ({
  //       ...combination,
  //       [labelName]: option,
  //     })),
  //   );
  // });
  //
  // return labelCombinations;
}
