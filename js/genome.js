function Genome(random, greedy, human) {
	this.random 	= random;
	this.greedy 	= greedy;
	this.human 		= human;
}

var mutation_prob = 0.25;
var mutation_amount = 0.05;

Genome.prototype.mutation = function () {
	var prob = new Array(10);
	for (i = 0; i < 10; i++) {
		prob[i] = Math.random();
	}
	if (prob[0] <= mutation_prob) {
		if (prob[1] < 0.5) {
			this.random = this.random + mutation_amount;
		}
		else this.random = this.random - mutation_amount;
	}
	if (prob[2] <= mutation_prob) {
		if (prob[3] < 0.5) {
			this.greedy = this.greedy + mutation_amount;
		}
		else this.greedy = this.greedy - mutation_amount;
	}
	if (prob[4] <= mutation_prob) {
		if (prob[5] < 0.5) {
			this.human = this.human + mutation_amount;
		}
		else this.human = this.human - mutation_amount;
	}
	var normalization = this.random + this.alphabeta + this.human;
	this.random = this.random/normalization;
	this.greedy = this.greedy/normalization;
	this.human = this.human/normalization;
};

Genome.prototype.update = function(random,greedy,human) {
	this.random = random;
	this.greedy = greedy;
	this.human = human;
}
