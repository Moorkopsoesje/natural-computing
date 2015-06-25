function Population(size) {
	this.agents = new Array(size);
	this.genomes = new Array(size);
	for (i = 0; i < size; i++) {
		var prob = Math.random();
		if (prob < 0.33) {
			this.genomes[i] = new Genome(1,0,0); // 1/3rd has pure random strategy
		}
		else if (prob >= 0.33 && prob < 0.67) {
			this.genomes[i] = new Genome(0,1,0); // 1/3rd has pure greedy strategy
		}
		else this.genomes[i] = new Genome(0,0,1); // 1/3rd has pure human strategy
		this.agents[i] = new Agent(this.genomes[i]);
	}
	this.pop = this.agents; // list of agents
	this.size = size; // amount of agents
}

// "T" for tournament, "R" for roulette wheel
var parentmethod = "T";
// choose tournament_size individuals from the population
var t_size = 3; // changing this will also change implementation, be aware!
// t_prob is probability of picking best from tournament, or second best, etc.
var t_prob = 0.75;
var t_amount = this.size/t_size; // amount of tournaments, amount of parents

Population.prototype.parentselection = function() {
	// Tournament selection
	if (parentmethod == "T") {
		var parents = new Array(t_amount);
		// Choose t_size individuals from population at random
		for (p = 0; p < t_amount; p++) {
				var selection = new Array(t_size);
				for (i = 0; i < t_size; i ++) {
					selection[i] = this.pop[Math.round(Math.random() * this.size)];
				}
				//picking the winner is dependent of t_size
				// if t_size changes, then there are more options to pick
				// not only best, second best and third best
				pick_prob = Math.random();
				var total = 1;
				for (i = 0; i < t_size; i++) {
					// probability of choosing ith best individual
					if (pick_prob >= (total-this.prototype.t_winner(i))) {
						//choose ith best individual
						parents[p] = selection[this.prototype.getWinner(selection,i)];
						break;
					}
					// for (i+1)th best individual, prob needs be between
					// ith best and ith+(i+1)th best
					else total = total-this.prototype.t_winner(i);
				}
		}
		// return parents
		return parents;
	}
	// Roulette wheel selection
	else if (parentmethod == "R") {
			// still need to implement
	}
};

// choose the best individual with prob p,
// second best p*(1-p), third best p*((1-p)^2)
Population.prototype.t_winner = function (n) {
	return (t_prob * ((1-t_prob)^n));
};

Population.prototype.getWinner = function(pool,best) {
	var original = pool;
	var orderfitness = new Array(t_size);
	for (j = 0; j < t_size; j++) {
		orderfitness[j] = pool[j].prototype.getFitness();
	}
	// sort fitness based on high first, low last
	orderfitness.sort(function(a, b){return b-a});
	for (k = 0; k < t_size; k++) {
		// compare which original agent had the nth best fitness
		if (orderfitness[best] == original[k].prototype.getFitness()){
			// index of pool member with nth best fitness
			return k;
		}
	}
	console.log("No corresponding agent to best fitness")
	return 0;
};



Population.prototype.update = function() {
	//update entire population, so first parentselection, then create new children
	var par = new Array(t_amount);
	par = this.prototype.parentselection();
};
