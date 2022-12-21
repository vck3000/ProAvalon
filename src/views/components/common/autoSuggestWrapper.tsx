import React, { useState } from 'react';
import Autosuggest from 'react-autosuggest';

const getSuggestionValue = (suggestion: HTMLInputElement) => {
  return suggestion.name;
};

const renderSuggestion = (suggestion: HTMLInputElement) => (
  <div>{suggestion.name}</div>
);

type Props = {
  allSuggestions: string[];
  setValue: (value: string) => void;
};

export function AutoSuggestWrapper({ allSuggestions, setValue }: Props) {
  // This {name: string}[] type is required by react-autosuggest
  const [visibleSuggestions, setVisibleSuggestions] = useState<
    { name: string }[]
  >([]);
  const [localValue, setLocalValue] = useState('');

  const getSuggestions = (name: string) => {
    if (name.length === 0) {
      return [];
    }

    return allSuggestions
      .filter(
        (str) =>
          str.toLowerCase().slice(0, name.length) === name.trim().toLowerCase(),
      )
      .map((suggestion) => ({
        name: suggestion,
      }));
  };

  const onChange = (
    event: React.FormEvent<HTMLInputElement>,
    { newValue }: { newValue: string },
  ) => {
    setLocalValue(newValue);

    // Pass data back to parent
    setValue(newValue);
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setVisibleSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setVisibleSuggestions([]);
  };

  const inputProps = {
    placeholder: 'Enter Player Name',
    value: localValue,
    onChange,
  };

  return (
    <Autosuggest
      suggestions={visibleSuggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
    />
  );
}
