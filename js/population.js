function Population(size) {
	this.agents = new Array(size);
	for (i = 0; i < size; i++) {
		var prob = Math.random();
		if (prob < 0.33) {
			this.agents[i] = new Agent(new Genome(1,0,0)); // 1/3rd has pure random strategy
		}
		else if (prob >= 0.33 && prob < 0.67) {
			this.agents[i] = new Agent(new Genome(0,1,0)); // 1/3rd has pure greedy strategy
		}
		else this.agents[i] = new Agent(new Genome(0,0,1)); // 1/3rd has pure human strategy
	}
	this.size = size; // amount of agents
}

// DECLARATIONS
// "T" for tournament, "R" for roulette wheel
var parentmethod = "T";
// choose tournament_size individuals from the population
var t_size = 10;
// t_prob is probability of picking best from tournament, or second best, etc.
var t_prob = 0.25;
var c_prob = 0.1; //chance for cross-over


/** Two algorithms for parent selection, either tournament or roulette wheel,
depends on parentmethod.
*/
Population.prototype.parentselection = function() {
	var parents = new Array(this.size);
	// TOURNAMENT SELECTION
	if (parentmethod == "T") {
		for (p = 0; p < this.size; p++) {
				// Choose t_size individuals from population at random
				var selection = new Array(t_size);
				for (i = 0; i < t_size; i ++) {
					selection[i] = this.agents[Math.round(Math.random() * this.size)];
				}
				// picking the winner is dependent of t_size
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
	}
	// ROULETTE WHEEL SELECTION
	else if (parentmethod == "R") {
		var total_fitness = 0;
		var proportional_fitness = new Array(this.size);
		// calculate accumulative fitness
		for (i = 0; i < this.size; i++) {
			total_fitness = total_fitness + this.agents[i].prototype.getFitness();
		}
		// for each agent, calculate the proportion of total fitness
		for (i = 0; i < this.size; i++) {
			if (i == 0) {
				proportional_fitness[i] = this.agents[i].prototype.getFitness()/total_fitness;
			}
			// each proportion has its own unique range, so add up from previous
			else proportional_fitness[i] = proportional_fitness[i-1] + this.agents[i].prototype.getFitness()/total_fitness;
		}
		// for each parent, pick random nr between 0-1 and see which proportion it is
		for (p = 0; p < this.size; p++) {
			pick_prob = Math.random();
			for (q = 0; q < this.size; q++) {
				// if it's smaller, then it's in range of proportion
				//(the first one to comply breaks the for-loop)
				if (pick_prob < proportional_fitness[q]) {
					parents[p] = this.agents[q];
					break;
				}
			}
		}
	}
	// return parents selected
	return parents;
};

/* Calculates probability to select nth best parent:
Choose the best individual with prob p,
Second best p*(1-p), third best p*((1-p)^2)
*/
Population.prototype.t_winner = function (n) {
	return (t_prob * ((1-t_prob)^n));
};


/** Returns the parent with the highest fitness (or nth highest,
depending on var best)
*/
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

/** Cross-over function
Takes two parents and with probability c_prob slices their genes
and recombines them to make two children
*/
Population.prototype.crossover(mother, father) {
	var children = new Array(2);
	children[0] = mother; //first copy parents
	children[1] = father;
	var r,g,h,r2,g2,h2;
	var cross = Math.random();
	var cross2 = Math.random();
	//cross-over between all genes
	if (cross < c_prob && cross2 < c_prob) {
		 r = mother.Genome.getRandom();
		 g = father.Genome.getGreedy();
		 h = mother.Genome.getHuman();
		 r2 = father.Genome.getRandom();
		 g2 = mother.Genome.getGreedy();
		 h2 = father.Genome.getHuman();
	}
	//cross-over after first gene
	else if (cross < c_prob) {
		r = mother.Genome.getRandom();
		g = father.Genome.getGreedy();
		h = father.Genome.getHuman();
		r2 = father.Genome.random();
		g2 = mother.Genome.getGreedy();
		h2 = mother.Genome.getHuman();
	}
	//cross-over after second gene
	else if (cross < c_prob2) {
		r = mother.Genome.getRandom();
		g = mother.Genome.getGreedy();
		h = father.Genome.getHuman();
		r2 = father.Genome.getRandom();
		g2 = father.Genome.getGreedy();
		h2 = mother.Genome.getHuman();
	}
	//no cross-over, children are same as parents
	else {
		return children[0], children[1];
	}
	//normalize so genome adds up to 1 again;
	norm = r + g + h;
	r = r/norm;
	g = g/norm;
	h = h/norm;
	norm2 = r2 + g2 + h2;
	r2 = r2/norm2;
	g2 = g2/norm2;
	h2 = h2/norm2;
	children[0].Genome.update(r,g,h);
	children[1].Genome.update(r2,g2,h2);
	return children[0], children[1];
}

/** This function replaces the agents in the population by the children
created through parent selection, cross-over and mutation
*/
Population.prototype.update = function() {
	//update entire population
	//first parent selection, then create new children
	var par = new Array(this.size);
	var children = new Array(this.size);
	par = this.prototype.parentselection();
	for (i = 0; i < this.size; i+2) {
		[children[i],children[i+1]] = this.prototype.crossover(par[i],par[i+1]);
	}
	for (i = 0; i < this.size; i++) {
		children[i].Genome.prototype.mutation();
	}
	this.agents = children; //update population
};
