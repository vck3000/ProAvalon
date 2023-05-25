class LocalStorage {

    storePlayerHighlightColour(number, colour) 
    {
         localStorage.setItem(
            `player${number}HighlightColour`,
            colour[number]
          );

    }

    getPlayerHighlightColour(number)
    {
         localStorage.getItem(`player${number}HighlightColour`); 
    }

}

export default LocalStorage; 