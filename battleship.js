// view object will update the display if it's hit or miss
var view = {

    // this method takes a string message and displays it
    // in the message display area
    displayMessage: function(msg){
        var messageArea = document.getElementById("messageArea");
        messageArea.innerHTML = msg;
    },
    // this method adds a HIT class to the cell selected
    displayHit: function(location){
        var cell = document.getElementById(location);
        cell.setAttribute("class", "hit");
    },
    // this method adds a MISS class to the cell selected
    displayMiss: function(location){
        var cell = document.getElementById(location);
        cell.setAttribute("class", "miss");
    }

}
/* testing display methods

view.displayMiss("00");
view.displayHit("34");
view.displayMiss("55");
view.displayHit("12");
view.displayMiss("25");
view.displayHit("26");
view.displayMessage("YOU SANK MY BATTLESHIP!") */

/*  Model object: will keep track of ship locations, hits, and misses
    it will communicate with view object this information so
    display changes accordingly.
    The model object will also contain the logic to test guesses
    for hits and misses.
*/
var model = {
    boardSize: 7,
    numShips: 3,
    shipLength: 3,
    shipsSunk:0,
        // ships is an object property with the value of an array
        // the values in this array are ship objects with 
        // two properties: locations and hits
    ships: [{ locations: [0, 0, 0], hits: ["","",""] }, 
            { locations: [0, 0, 0], hits: ["","",""] },
            { locations: [0, 0, 0], hits: ["","",""] }],
    fire: function(guess){
        // this method will accept a guess, iterate over ships,
        // and interact with the view to show if it's a hit or miss
        // returns TRUE if ship is hit & FALSE if ship is missed
        for (var i = 0; i < this.numShips; i++){
            var ship = this.ships[i];
            // indexOf will try to find index number of an exact
            // match to user's guess. If it can't it will return -1
            var index = ship.locations.indexOf(guess);
            if (index >= 0){ 
                // if index is 0+, HIT!
                ship.hits[index] = "hit";
                view.displayHit(guess);
                view.displayMessage("HIT!");
   // Added after isSunk method was created
                if (this.isSunk(ship)){
                    view.displayMessage("You sank my battleship!");
                    this.shipsSunk++;
                }
                return true;
            }
        }
        /*  if we make it through all iterations of the ships
            and none of the locations are a match, return false
        */
        view.displayMiss(guess);
        view.displayMessage("You missed.");
        return false;
    },
    isSunk: function(ship){
        /*  For each ship, iterate through ship length. 
            if even one of the values in the hit array are
            empty, then ship is still floating, so method will
            return false! */
        for (var i = 0; i < this.shipLength; i++){
            if (ship.hits[i] !== "hit"){
                return false;
            }
        }
        return true; 
        //returns true ONLY if all values of hit array are hit!
    },  
    // More methods added to generate random ship locations!
    //this is the MASTER method that will generate random ship locations
    generateShipLocations: function(){
        var locations;
        for (var i = 0; i < this.numShips; i++){
            do {
                // generate a set of ship locations
                locations = this.generateShip();
                // check for collisions with existing ships on the board
            } while (this.collision(locations));
            // if no collisions, new set of locations will be set for each ship
            this.ships[i].locations = locations;
        }
    },
    generateShip: function(){
        // This method generates one random ship
        // first, determine direction of ship 
        // if 0 = vertical, if 1 = horizontal
        var direction = Math.floor(Math.random()) * 2;
        var row;
        var col;
        if (direction === 1){
            //Generate a starting location for a horizontal ship
            //Note we can use any row here, but we must use shipLength to limit which column it starts in
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * (this.boardSize - (this.shipLength + 1)));
        } else {
            //Generate a starting location for a vertical ship
            row = Math.floor(Math.random() * (this.boardSize - (this.shipLength + 1)));
            col = Math.floor(Math.random() * this.boardSize); 
        }
        
         var newShipLocations = [];
         for (var i = 0; i < this.shipLength; i++){
             if (direction === 1){
                 //Add location to array for new horizontal ship
                 newShipLocations.push(row + "" + (col + i));
                 // the "" is added to return a string to my array, not number
             } else {
                 //Add locations to array for new vertical ship
                 newShipLocations.push((row + i) + "" + col);
             }
         }
         return newShipLocations;
    },
    collision: function(locations){
        // outer loop to iterate through all possible ships
        for (var i = 0; i < this.numShips; i++){
            var ship = this.ships[i];
            // inner loop to iterate through each ship position
            for (var j = 0; j < locations.length; j++){
                // if our new locations match any existing ship location
                // return true, because we have a collision
                if (ship.locations.indexOf(locations[j]) >= 0){
                    return true;
                }
            }
        }
        return false;
    }
} 
/*  Controller object: will get user input, process the input into
    data that the Model object can use to perform its logic.
    It will also track number of guesses, and progress of game
    (if all ships are sunk, then Game Over!)
*/
var controller = {
    guesses: 0,
    processGuess: function(guess){
        var location = parseGuess(guess);
        //validate user guess, if it's not null, it will return true
        if (location) { 
            this.guesses++;
            var hit = model.fire(location);
            if (hit && model.shipsSunk === model.numShips){
                view.displayMessage("You sank all my battleships! It only took " + this.guesses + " guesses!");
            } 
        }
    }
}

/*  Creating a helper function to help us process user input 
    This helper function was created before writing any methods
    on the controller object. */
function parseGuess(guess){
    var alphabet = ["A", "B", "C", "D", "E", "F", "G"];
    //check if guess is null or not of length 2
    if (guess === null || guess.length !== 2){
        alert("Oops, please enter a letter and a number of the board.");
    } else {
        //get first character of guess, turn it into a number
        var firstChar = guess.charAt(0);
        var row = alphabet.indexOf(firstChar); //type: number
        //get second character of guess, it should already be in the format "number"
        var column = guess.charAt(1); //type: string

        // check if conversion was successful / if both inputs are numbers
        if (isNaN(row) || isNaN(column)){
            alert("Oops, that isn't on the board.");
          //check if row# and column# are within the range 
          // (in this case 0-6 because board size is 7)
        } else if (row < 0 || row >= model.boardSize || column < 0 || 
                    column >= model.boardSize){
            alert("Oops, that's off the board!");
        } else {
        /*  if all tests have been passed, return processed guess
            these should be strings from 00 -> 66
            since typeOf(row) = number & typeOf(column)= string 
            it will return a string! */
            return row + column;
        }
    }
    return null;
}

//  enabling user to input guesses and use fire! button

function init(){
    // in case fire button is pressed
    var fireButton = document.getElementById("fireButton");
    fireButton.onclick = handleFireButton;
    // in case return key is pressed
    var guessInput = document.getElementById("guessInput");
    guessInput.onkeypress = handleKeyPress;

    model.generateShipLocations();
}

function handleFireButton(){
    //code to get the value form the form
    var guessInput = document.getElementById("guessInput");
    var guess = guessInput.value;
    controller.processGuess(guess);
    //resets the form input element to be an empty string
    guessInput.value = ""; 
}

function handleKeyPress(e){
    var fireButton = document.getElementById("fireButton");
    if (e.keyCode === 13){
        fireButton.click();
        return false;
    }
}

window.onload = init; //run init when page is fully loaded