function Population(size) {
	var agents = new Array(size);
	var genomes = new Array(size);
	for (i = 0; i < size; i++) {
		var prob = Math.random();
		if (prob <= 0.33) {
			genomes[i] = new Genome(1,0,0);
		}
		elseif (prob > 0.33 && prob <= 0.67) {
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
	if (parentmethod == "T") {

		// Choose parents


		// return parents
	}
	else if (parentmethod == "R") {
		
	}
}
