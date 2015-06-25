function Population(size) {
	var agents = new Array(size);
	var genomes = new Array(size);
	for (i = 0; i < size; i++) {
		var prob = Math.random();
		if (prob < 0.33) {
			genomes[i] = new Genome(1,0,0);
		}
		else if (prob >= 0.33 && prob < 0.67) {
			genomes[i] = new Genome(0,1,0);
		}
		else genomes[i] = new Genome(0,0,1);
		agents[i] = new Agent(genomes[i]);
	}
	this.pop = agents;
}

// "T" for tournament, "R" for roulette wheel
var parentmethod = "T";

Population.prototype.parentselection = function() {
	// Get all fitness functions from parents
	var fitness = new Array(this.pop.length);
	for (i = 0; i < this.pop.length; i++) {
		fitness[i] = this.pop[i].getFitness();
	}
	// Tournament selection
	if (parentmethod == "T") {
		// Choose k individuals from population at random
		for (p = 0; p < 4; p++) {
			var k = 3;
			var parents = new Array(k);
			for (i = 0; i < tournament; i ++) {
				parents[i] = Math.round(Math.random() * this.pop.length);
			}
		
		}
		// return parents
	}

	// Roulette wheel selection
	else if (parentmethod == "R") {

	}
}


Population.prototype.update = function() {

}
