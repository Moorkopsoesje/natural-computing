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
var mutation_prob = 0.25;
var mutation_amount = 0.05;


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
					//console.log(selection[i])
				}
				// picking the winner is dependent of t_size
				// if t_size changes, then there are more options to pick
				// not only best, second best and third best
				pick_prob = Math.random();
				var total = 1;
				for (i = 0; i < t_size; i++) {
					// probability of choosing ith best individual
					if (pick_prob >= (total-this.t_winner(i))) {
						//choose ith best individual
						parents[p] = selection[this.getWinner(selection,i)];
						break;
					}
					// for (i+1)th best individual, prob needs be between
					// ith best and ith+(i+1)th best
					else total = total-this.t_winner(i);
				}
		}
	}
	// ROULETTE WHEEL SELECTION
	else if (parentmethod == "R") {
		var total_fitness = 0;
		var proportional_fitness = new Array(this.size);
		// calculate accumulative fitness
		for (i = 0; i < this.size; i++) {
			total_fitness = total_fitness + this.agents[i].fitness;
			//console.log(this.agents[i].fitness);
		}
		// for each agent, calculate the proportion of total fitness
		for (i = 0; i < this.size; i++) {
			if (i == 0) {
				proportional_fitness[i] = this.agents[i].fitness/total_fitness;
			}
			// each proportion has its own unique range, so add up from previous
			else proportional_fitness[i] = proportional_fitness[i-1] + this.agents[i].fitness/total_fitness;
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
		// Fast bug-fix, don't know if this the right solution.
		if (pool[j] != null) {
			orderfitness[j] = pool[j].fitness;
		}
		else {
			orderfitness[j] = 0;
		}
	}
	// sort fitness based on high first, low last
	orderfitness.sort(function(a, b){return b-a});
	for (k = 0; k < t_size; k++) {
		// compare which original agent had the nth best fitness
		// Quick bug-fix, don't know if it's the right thing to do.
		if (original[k] != null) {
			if (orderfitness[best] == original[k].fitness){
				// index of pool member with nth best fitness
				return k;
			}
		}
	}
	console.log("No corresponding agent to best fitness")
	return 0;
};

/** Cross-over function
Takes two parents and with probability c_prob slices their genes
and recombines them to make two children
*/
Population.prototype.crossover = function(mother, father) {
	var children = new Array(2);
	children[0] = mother; //first copy parents
	children[1] = father;
	var r,g,h,r2,g2,h2;
	var cross = Math.random();
	var cross2 = Math.random();
	//cross-over between all genes
	if (cross < this.c_prob && cross2 < this.c_prob) {
		 r = mother.Genome.random;
		 g = father.Genome.greedy;
		 h = mother.Genome.human;
		 r2 = father.Genome.random;
		 g2 = mother.Genome.greedy;
		 h2 = father.Genome.human;
	}
	//cross-over after first gene
	else if (cross < this.c_prob) {
		r = mother.Genome.random;
		g = father.Genome.greedy;
		h = father.Genome.human;
		r2 = father.Genome.random;
		g2 = mother.Genome.greedy;
		h2 = mother.Genome.human;
	}
	//cross-over after second gene
	else if (cross < this.c_prob2) {
		r = mother.Genome.random;
		g = mother.Genome.greedy;
		h = father.Genome.human;
		r2 = father.Genome.random;
		g2 = father.Genome.greedy;
		h2 = mother.Genome.human;
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
	return [children[0], children[1]];
};

Population.prototype.mutation = function (agent) {
	var probs = new Array(6);
	var random, greedy, human;
	for (i = 0; i < 10; i++) {
		probs[i] = Math.random();
	}
	if (probs[0] <= mutation_prob) {
		if (probs[1] < 0.5) {
			random = agent.Genome.random + mutation_amount;
		}
		else random = agent.Genome.random - mutation_amount;
	}
	if (probs[2] <= mutation_prob) {
		if (probs[3] < 0.5) {
			greedy = agent.Genome.greedy + mutation_amount;
		}
		else greedy = agent.Genome.greedy - mutation_amount;
	}
	if (probs[4] <= mutation_prob) {
		if (probs[5] < 0.5) {
			human = agent.Genome.human + mutation_amount;
		}
		else human = agent.Genome.human - mutation_amount;
	}
	var normalization = random + alphabeta + human;
	agent.Genome.update(random/normalization, greedy/normalization, human/normalization);
	return agent;
};


/** This function replaces the agents in the population by the children
created through parent selection, cross-over and mutation
*/
Population.prototype.update = function() {
	console.log("Start updating..")
	//update entire population
	//first parent selection, then create new children
	var par = new Array(this.size);
	var children = new Array(this.size);
	console.log("Parent selection")
	par = this.parentselection();
	console.log("Crossover")
	for (i = 0; i < this.size; i+2) {
		//console.log("children = " + i + " and " + (i+1))
		var newChildren = this.crossover(par[i],par[i+1]);
		children[i]   = newChildren[0];
		children[i+1] = newChildren[1];
	}
	console.log("Mutation")
	for (i = 0; i < this.size; i++) {
		children[i] = this.mutation(children[i]);
	}
	this.agents = children; //update population
	console.log("End updating..")
};
