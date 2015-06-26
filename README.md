##Running the GA in the game 2048
To run the code perform the following steps

- Unzip
- In your terminal (Mac)/console (Windows), go to the directory containing the unzipped project
- Type "python -m SimpleHTTPServer
- Go to your browser, preferably Chrome, to "localhost:8000"
- The code will run automatically

To change the code, in the folder '/js/' are all the javascript files. In population.js you will find several parameters, such as parentmethod ("T" for tournament or "R" for roulette wheel), mutation_rate, c_prob for cross-over probability, etc.) In the comments you will find the explanations of these parameters. In the game_manager, the population size is declared and the used fitness function (weights or noweights).
- If changes have been made to the settings in the code, save the code and refresh the browser.

Plots are created in the `./plots/` folder and are updated every 10 iterations.

### Code awknowledgements
Source code from 2048 is retrieved from https://github.com/gabrielecirulli/2048
