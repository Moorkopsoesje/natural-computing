function Strategies(lastmove) {
	// lastmove:
	// 0: Up
    // 1: Right
    // 2: Down
    // 3: Left
	this.lastmove = lastmove;
}

Strategies.prototype.random = function() {
	return Math.floor((Math.random() * 4));		// returns next move, random number (0, 1, 2 or 3)
};

Strategies.prototype.greedy = function() {
	// TODO: for each move, determine fitness function and choose move with highest fitness
};

Strategies.prototype.human = function() {	
	// TODO: check if moves are valid / possible, if not valid, change move
	if(this.lastmove == 3) { 		// Left
		this.lastmove = 0;
		return 0; 				// Up
	}
	else if (this.lastmove == 0) { 	// Up
		this.lastmove = 3;
		return 3;				// Left
	}
	else if (this.lastmove == 1) {	// Right
		this.lastmove = 3;
		return 3;				// Left
	}
	else if (this.lastmove == 2) {	// Down
		this.lastmove = 0;
		return 0;				// Up
	}
	else {
		return -1;				// Should not come here
	}
};