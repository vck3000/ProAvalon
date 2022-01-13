import React, { useState } from 'react';
import Autosuggest from 'react-autosuggest';

// Imagine you have a list of languages that you'd like to autosuggest.
// const languages = [
//   {
//     name: 'C',
//     year: 1972,
//   },
//   {
//     name: 'Elm',
//     year: 2012,
//   },
// ];

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = (suggestion: HTMLInputElement) => suggestion.name;

// Use your imagination to render suggestions.
const renderSuggestion = (suggestion: HTMLInputElement) => (
  <div>{suggestion.name}</div>
);

type Props = {
  data: { name: string }[];
};

export function AutoSuggestWrapper({ data }: Props) {
  // Autosuggest is a controlled component.
  // This means that you need to provide an input value
  // and an onChange handler that updates this value (see below).
  // Suggestions also need to be provided to the Autosuggest,
  // and they are initially empty because the Autosuggest is closed.
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  // this.state = {
  //   value: '',
  //   suggestions: [],
  // };

  console.log(data);

  // Teach Autosuggest how to calculate suggestions for any given input value.
  const getSuggestions = (value: string) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : data.filter(
          (str) => str.name.toLowerCase().slice(0, inputLength) === inputValue
        );
  };

  const onChange = (
    event: React.FormEvent<HTMLInputElement>,
    { newValue }: { newValue: string }
  ) => {
    setValue(newValue);
    // this.setState({
    //   value: newValue,
    // });
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
    // this.setState({
    //   suggestions: getSuggestions(value),
    // });
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
    // this.setState({
    //   suggestions: [],
    // });
  };

  // Autosuggest will pass through all these props to the input.
  const inputProps = {
    placeholder: 'Type a programming language',
    value,
    onChange,
  };

  // Finally, render it!
  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={inputProps}
    />
  );
}
