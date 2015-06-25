function Agent(genome) {
	this.genome = genome;

	this.highscore = 0;
	this.emptycells = 14;
	this.amountmoves = 0;
}

Agent.prototype.update = function (grid) {
	this.emptycells = grid.prototype.amountAvailable();
	this.highscore = grid.prototype.highestScore();
	this.amountmoves = this.amountmoves + 1;
};
