function GameManager(size, InputManager, Actuator, StorageManager) {
  this.size           = size; // Size of the grid
  this.inputManager   = new InputManager;
  this.storageManager = new StorageManager;
  this.actuator       = new Actuator;

  this.startTiles     = 2;

  //this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  lastmove = 0;
  this.setup();
};

// Keep playing after winning (allows going over 2048)
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
};

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {
  return this.over || (this.won && !this.keepPlaying);
};

// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();

  // Reload the game from a previous game if present
  if (previousState) {
    this.grid        = new Grid(previousState.grid.size,
                                previousState.grid.cells); // Reload grid
    this.score       = previousState.score;
    this.over        = previousState.over;
    this.won         = previousState.won;
    this.keepPlaying = previousState.keepPlaying;
  } else {
    this.grid        = new Grid(this.size);
    this.score       = 0;
    this.over        = false;
    this.won         = false;
    this.keepPlaying = false;

    // Add the initial tiles
    this.addStartTiles();
  }

  // Update the actuator
  this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }

  // Clear the state when the game is over (game over only, not win)
  if (this.over) {
    this.storageManager.clearGameState();
  } else {
    this.storageManager.setGameState(this.serialize());
  }

  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.storageManager.getBestScore(),
    terminated: this.isGameTerminated()
  });
  
  // Test run (random):
  var direction = this.random();
  //console.log("var direction = " + direction)
  //this.move(direction);
  
  // Test run (greedy):
  //var direction = this.greedy();
  //console.log("var direction = " + direction)
  //this.move.bind(direction);
  
  // Test run (human):
  //var direction = this.human();
  //console.log("var direction = " + direction)
  //this.move(direction);
  
  
};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
    keepPlaying: this.keepPlaying
  };
};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
   //console.log("Direction is: " + direction)
  // 0: up, 1: right, 2: down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;

          // The mighty 2048 tile
          if (merged.value === 2048) self.won = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
    }

    this.actuate();
  }
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // Up
    1: { x: 1,  y: 0 },  // Right
    2: { x: 0,  y: 1 },  // Down
    3: { x: -1, y: 0 }   // Left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};

GameManager.prototype.fitnessweights = function () {
	// Highest number x. (2^x = value)
	var x = Math.log2(this.storageManager.getBestScore());
	// Amount of empty cells n.
	var n = this.grid.amountAvailable();
	
	return x + n;
};

GameManager.prototype.fitnessnoweights = function () {
	// Highest number x. (value / 100 = x)
	var x = this.storageManager.getBestScore() / 100;
	// Amount of empty cells n.
	var n = this.grid.amountAvailable();
	
	return x + n;
};


// Strategies //

// Random
GameManager.prototype.random = function() {
	  var array = [0, 1, 2, 3];
	  var m = 4;
	  // While there remain elements to shuffle…
	  while (m) {

	    // Pick a remaining element…
	    i = Math.floor(Math.random() * m--);

	    // And swap it with the current element.
	    t = array[m];
	    array[m] = array[i];
	    array[i] = t;
	  }
	  //console.log(array);
	  var direction = this.preferredDirection(array[0], array[1], array[2], array[3]);
	  //console.log("direction: " + direction)
	  return direction; 	// returns next move, random number (0, 1, 2 or 3)
};

// Greedy
GameManager.prototype.greedy = function() {
	// FF Up:
	var ffup = this.fitness(0);
	
	// FF Right:
	var ffright = this.fitness(1);

	// FF Down:
	var ffdown = this.fitness(2);

	// FF Left:
	var ffleft = this.fitness(3);
	
	var array = this.makeArray(ffup, ffright, ffdown, ffleft);
	
	var direction = this.preferredDirection(array[0], array[1], array[2], array[3]);

	return direction;
};

GameManager.prototype.makeArray = function(up, right, down, left) {
	directions = [up, right, down, left];
	
	var pos1 = Math.max(directions[0], directions[1], directions[2], directions[3]);
	var ind1 = directions.indexOf(pos1);
	if (ind1 > -1) {
		directions.splice(ind1, 1);
	}
	
	var pos2 = Math.max(directions[0], directions[1], directions[2]);
	var ind2 = directions.indexOf(pos2);
	if (ind2 > -1) {
		directions.splice(ind2, 1);
	}
	
	var pos3 = Math.max(directions[0], directions[1]);
	var ind3 = directions.indexOf(pos3);
	if (ind3 > -1) {
		directions.splice(ind3, 1);
	}
	
	var pos4 = directions[0];
	
	var array = [pos1, pos2, pos3, pos4];
	
	return array;
};

GameManager.prototype.fitness = function(direction) {
	var previousState = this.storageManager.getGameState();
	this.move(direction);
	
	// TODO: determine fitness function of current state
	var fitness = 0;
	
	this.storageManager.setGameState(previousState);
	return fitness;
};

var lastmove = 0;

// Human
GameManager.prototype.human = function() {		
	var newDirection = -1;
	if(lastmove == 3) { 		// Left
		newDirection = this.preferredDirection(0, 3, 1, 2);
		lastmove = newDirection;
		return newDirection;		
	}
	else if (lastmove == 0) { 	// Up
		newDirection = this.preferredDirection(3, 0, 1, 2);
		lastmove = newDirection;
		return newDirection;					
	}
	else if (lastmove == 1) {	// Right
		newDirection = this.preferredDirection(0, 3, 1, 2);
		lastmove = newDirection;
		return newDirection;					
	}
	else if (lastmove == 2) {	// Down
		newDirection = this.preferredDirection(0, 3, 1, 2);
		lastmove = newDirection;
		return newDirection;					
	}
	else {
		console.log("Should not come here")
		return newDirection;		// Should not come here
	}
};

GameManager.prototype.preferredDirection = function(optionA, optionB, optionC, optionD) {
	var previousState = this.storageManager.getGameState();
	//console.log("previousState: " + previousState)
	//this.movePossible(optionA);
	if(!this.movePossible(optionA)) {
		//console.log(this.storageManager.getGameState())
		this.storageManager.setGameState(previousState);
		if(!this.movePossible(optionB)) {
			this.storageManager.setGameState(previousState);
			if(!this.movePossible(optionC)) {
				this.storageManager.setGameState(previousState);
				return optionD;
			}
			else {
				return optionC;
			}
		}
		else {
			return optionB;
		}
	}
	else {
		return optionA;
	}
};

// Move tiles on the grid in the specified direction
GameManager.prototype.movePossible = function (direction) {
  //console.log("Direction is: " + direction)
  // 0: up, 1: right, 2: down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;

          // The mighty 2048 tile
          if (merged.value === 2048) self.won = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });
  
  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
    }

    this.actuate();
  }
  
  return moved;
};