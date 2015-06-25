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
	this.size = size;
}

// "T" for tournament, "R" for roulette wheel
var parentmethod = "T";
// choose tournament_size individuals from the population
var t_size = 3;
var t_prob = 0.75;
var t_amount = this.size/t_size; // amount of tournaments


Population.prototype.parentselection = function() {
	// Get all fitness functions from parents
	var fitness = new Array(this.size);
	for (i = 0; i < this.size; i++) {
		fitness[i] = this.pop[i].getFitness();
	}
	// Tournament selection
	if (parentmethod == "T") {
		var parents = new Array(t_amount);
		// Choose t_size individuals from population at random
		for (p = 0; p < t_amount; p++) {
				var selection = new Array(t_size);
				for (i = 0; i < t_size; i ++) {
					selection[i] = this.pop[Math.round(Math.random() * this.size)];
				}
				pick_prob = Math.random();
				if (pick_prob < this.prototype.t_winner(0)) {
						//choose best individual
						parents[p] = selection[this.prototype.getWinner(selection,1)];
				}
				else if (pick_prob >= this.prototype.t_winner(0) && pick_prob < (this.prototype.t_winner(0) + this.prototype.t_winner(1))) {
						//choose second best
						parents[p] = selection[this.prototype.getWinner(selection,2)];
				}
				else parents[p] = selection[this.prototype.getWinner(selection,3)];

		}
		// return parents
		return parents;
	}

	// Roulette wheel selection
	else if (parentmethod == "R") {
			// still need to implement
	}
}

// choose the best individual with prob p,
// second best p*(1-p), third best p*((1-p)^2)
Population.prototype.t_winner = function (n) {
	return (t_prob * ((1-t_prob)^n));
}

Population.prototype.getWinner = function(pool,best) {
	//still need to implement 2nd best & 3rd best!!
	var index = -1;
	var highest_fitness = 0;
	for (i = 0; i < t_size; i++) {
		if (pool[i].prototype.getFitness() > highest_fitness) {
			index = i;
			highest_fitness = pool[i].prototype.getFitness();
		}
	}
	if (index == -1) {
		index = Math.round(Math.random() * (t_size-1));
	}
	return index;
}


Population.prototype.update = function() {
	//update entire population, so first parentselection, then create new children
}
