function Genome(random, greedy, human) {
	this.random 	= random;
	this.greedy 	= greedy;
	this.human 		= human;
}

Genome.prototype.update = function(random,greedy,human) {
	this.random = random;
	this.greedy = greedy;
	this.human = human;
}
