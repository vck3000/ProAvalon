import { generateLabelCombinations } from '../metricFunctions';

describe('MetricFunctions', () => {
  describe('Generate label combinations', () => {
    it('returns an empty array for empty labelOptions.', () => {
      const labelOptions = {};
      expect(generateLabelCombinations(labelOptions)).toEqual([{}]);
    });

    it('generates label combinations for a single label.', () => {
      const labelOptions = {
        label1: new Set(['a', 'b', 'c']),
      };

      const expectedResult = [
        { label1: 'a' },
        { label1: 'b' },
        { label1: 'c' },
      ];

      expect(generateLabelCombinations(labelOptions)).toEqual(expectedResult);
    });

    it('generates label combinations for multiple labels with a single option.', () => {
      const labelOptions = {
        label1: new Set(['a']),
        label2: new Set(['b']),
        label3: new Set(['c']),
      };

      const expectedResult = [{ label1: 'a', label2: 'b', label3: 'c' }];

      expect(generateLabelCombinations(labelOptions)).toEqual(expectedResult);
    });

    it('generates label combinations for multiple labels with multiple options.', () => {
      const labelOptions = {
        label1: new Set(['a', 'b', 'c']),
        label2: new Set(['d', 'e']),
      };

      const expectedResult = [
        { label1: 'a', label2: 'd' },
        { label1: 'a', label2: 'e' },
        { label1: 'b', label2: 'd' },
        { label1: 'b', label2: 'e' },
        { label1: 'c', label2: 'd' },
        { label1: 'c', label2: 'e' },
      ];

      expect(generateLabelCombinations(labelOptions)).toEqual(expectedResult);
    });
  });
});
