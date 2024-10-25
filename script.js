
// Global variable to cache all game data
let cachedGameData = null;

// Actually get the data
async function getLiveData() {

    // If cached data exists, return it
    if (cachedGameData) {
        return cachedGameData;
    }

    try {
        // Fetch the data from allgamedata.json only once
        const response = await fetch('allgamedata.json');

        if (response.ok) {
            cachedGameData = await response.json(); // Store data in memory
            return cachedGameData;
        } else {
            console.error('Error fetching data:', response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Request failed:', error);
        return null;
    }
}

async function getActivePlayerTeam() {
    try {
        const allGameData = await getLiveData(); // Use cached game data
        const activePlayerName = allGameData.activePlayer.riotIdGameName; // Get active player name

        // Find the active player in the 'allPlayers' list
        const activePlayer = allGameData.allPlayers.find(player => player.riotIdGameName === activePlayerName);
        
        if (activePlayer) {
            console.log("Active player team:", activePlayer.team); // Log the active player's team
            return activePlayer.team; // Return the active player's team if found
        } else {
            console.log("Active player not found."); // Log if active player is not found
            return null; // Return null if player is not found
        }
    } catch (error) {
        console.error('Error fetching active player or player list:', error);
        return null; // Return null on error
    }
}

// Function to display player stats
function displayTeamStats(teamStats, teamTableId) {
    const teamTable = document.querySelector(`#${teamTableId} tbody`);
    const teamHeader = document.querySelector(`#${teamTableId} thead tr`); // Select the header row of the table
    
    if (!teamTable) {
        console.error(`Element with id #${teamTableId} not found.`);
        return;
    }

    teamTable.innerHTML = '';  // Clear existing content

    // Calculate totals for the team
    const totalKills = teamStats.reduce((sum, player) => sum + player.kills, 0);
    const totalDeaths = teamStats.reduce((sum, player) => sum + player.deaths, 0);
    const totalAssists = teamStats.reduce((sum, player) => sum + player.assists, 0);
    const totalCS = teamStats.reduce((sum, player) => sum + player.cs, 0);
    const totalGold = teamStats.reduce((sum, player) => sum + player.totalGold, 0);
    const avgLevel = teamStats.reduce((sum, player) => sum + player.level, 0) / 5;
    const activePlayerTeam = getActivePlayerTeam();

    // Update the header with the totals
    if (teamTableId === 'order-list') {
    teamHeader.innerHTML = `
        <th>Item Gold</th>
        <th>CS</th>
        <th>K/D/A</th>
        <th>Level</th>
        <th>Champion</th>
        <th>${activePlayerTeam === 'ORDER' ? 'Red Team' : 'Blue Team'} Player</th>
    `;
    } else if (teamTableId === 'chaos-list') {
        teamHeader.innerHTML = `
            <th> ${activePlayerTeam === 'CHAOS' ? 'Blue Team' : 'Red Team'} Player</th>
            <th>Champion</th>
            <th>Level</th>
            <th>K/D/A</th>
            <th>CS</th>
            <th>Item Gold</th>
        `;
        }

    teamStats.forEach(player => {
        const row = document.createElement('tr');
        
        if (teamTableId === 'order-list') {
            row.innerHTML = `
                <td>${player.totalGold}</td>
                <td>${player.cs}</td>
                <td>${player.kills}/${player.deaths}/${player.assists}</td>
                <td>${player.level}</td>
                <td>${player.champion}</td>
                <td>${player.name}</td>
            `;
        } else if (teamTableId === 'chaos-list') {
            row.innerHTML = `
                <td>${player.name}</td>
                <td>${player.champion}</td>
                <td>${player.level}</td>
                <td>${player.kills}/${player.deaths}/${player.assists}</td>
                <td>${player.cs}</td>
                <td>${player.totalGold}</td>
            `;
        }

        teamTable.appendChild(row);  
    });
}

// Fetch and display live game data
async function gameInformation() {
    const gameData = await getLiveData(); 
    const allPlayers = gameData.allPlayers; 

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamOrder = allPlayers.filter(player => player.team === 'ORDER');
    const teamChaos = allPlayers.filter(player => player.team === 'CHAOS');

    const teamOrderStats = teamOrder.map(player => ({
        name: player.riotIdGameName,
        champion: player.championName,
        level: player.level,
        kills: player.scores.kills,
        cs: player.scores.creepScore,
        deaths: player.scores.deaths,
        assists: player.scores.assists,
        totalGold: calculateTotalGold(player)
    }));

    const teamChaosStats = teamChaos.map(player => ({
        name: player.riotIdGameName,
        champion: player.championName,
        level: player.level,
        kills: player.scores.kills,
        cs: player.scores.creepScore,
        deaths: player.scores.deaths,
        assists: player.scores.assists,
        totalGold: calculateTotalGold(player)
    }));

    // Display individual player stats
    displayTeamStats(teamOrderStats, 'order-list');
    displayTeamStats(teamChaosStats, 'chaos-list');
}

function calculateTotalGold(player) {
    const itemsGold = player.items.reduce((acc, item) => {
        const itemPrice = parseFloat(item.price);
        return acc + (isNaN(itemPrice) ? 0 : itemPrice);  //  0 if price is NaN
    }, 0);
    
    const currentGold = parseFloat(player.currentGold);
    
    return Math.floor(itemsGold + (isNaN(currentGold) ? 0 : currentGold));  //  0 if currentGold is NaN
}

//get game time in minutes:seconds and only seconds
async function getGameTime() {
    const gameTimeData = await getLiveData(); 
    const time = gameTimeData.gameData.gameTime
    const minutes = Math.floor(time / 60)
    const seconds = (time % 60).toFixed(0)
    const gameTime = `${minutes}m ${seconds}s`

    console.log("game time::", gameTime);
    return gameTime
}

async function getGameTimeSeconds() {
    const gameTimeData = await getLiveData(); 
    const time = gameTimeData.gameData.gameTime
    
    return time
}

// Calculate kills
async function getOrderKills() {
    const gameData = await getLiveData(); 
    const allPlayers = gameData.allPlayers; 

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamOrderKills = allPlayers
        .filter(player => player.team === 'ORDER') 
        .reduce((total, player) => total + player.scores.kills, 0); 

    return teamOrderKills;
}

async function getChaosKills() {
    const gameData = await getLiveData(); 
    const allPlayers = gameData.allPlayers; 

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamChaosKills = allPlayers
        .filter(player => player.team === 'CHAOS') 
        .reduce((total, player) => total + player.scores.kills, 0); 

    return teamChaosKills;
}

//get levels
async function getOrderLevels() {
    const gameData = await getLiveData();
    const allPlayers = gameData.allPlayers; 

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamOrderLevels = allPlayers
        .filter(player => player.team === 'ORDER') 
        .reduce((total, player) => total + player.level, 0); 

    return teamOrderLevels;
}

async function getChaosLevels() {
    const gameData = await getLiveData();
    const allPlayers = gameData.allPlayers; 

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamChaosLevels = allPlayers
        .filter(player => player.team === 'CHAOS') 
        .reduce((total, player) => total + player.level, 0); 

    return teamChaosLevels;
}

// Calculate deaths difference
async function getOrderDeaths() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }
    
    const teamOrderDeaths = allPlayers
        .filter(player => player.team === 'ORDER')
        .reduce((total, player) => total + player.scores.deaths, 0);

    return teamOrderDeaths;
}

async function getChaosDeaths() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }
    
    const teamChaosDeaths = allPlayers
        .filter(player => player.team === 'CHAOS')
        .reduce((total, player) => total + player.scores.deaths, 0);

    return teamChaosDeaths;
}

// Calculate assists difference
async function getOrderAssists() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    } 
    
    const teamOrderAssists = allPlayers
        .filter(player => player.team === 'ORDER')
        .reduce((total, player) => total + player.scores.assists, 0);
   
    return teamOrderAssists;
}

async function getChaosAssists() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    } 
    
    const teamChaosAssists = allPlayers
        .filter(player => player.team === 'CHAOS')
        .reduce((total, player) => total + player.scores.assists, 0);
   
    return teamChaosAssists;
}

// Calculate CS difference
async function getOrderCS() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }
    
    const teamOrderCS = allPlayers
        .filter(player => player.team === 'ORDER')
        .reduce((total, player) => total + player.scores.creepScore, 0);

    return teamOrderCS;
}

async function getChaosCS() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }
    
    const teamChaosCS = allPlayers
        .filter(player => player.team === 'CHAOS')
        .reduce((total, player) => total + player.scores.creepScore, 0);

    return teamChaosCS;
}

// Calculate total gold difference
async function getOrderGold() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamOrderGold = allPlayers
        .filter(player => player.team === 'ORDER')
        .reduce((total, player) => total + calculateTotalGold(player), 0);

    return teamOrderGold;
}

async function getChaosGold() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamChaosGold = allPlayers
        .filter(player => player.team === 'CHAOS')
        .reduce((total, player) => total + calculateTotalGold(player), 0);

    return teamChaosGold;
}

// Calculate dragons taken
async function getOrderDragon() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamOrderDragon = gameData.events.Events 
        .filter(event => event.EventName === "DragonKill")
        .filter(event => {
            return allPlayers.some(player => player.team === 'ORDER');
        }).length;

    return teamOrderDragon;
}

async function getChaosDragon() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamChaosDragon = gameData.events.Events 
        .filter(event => event.EventName === "DragonKill")
        .filter(event => {
            return allPlayers.some(player => player.team === 'CHAOS');
        }).length;

    return teamChaosDragon;
}

// Calculate baron taken
async function getOrderBaron() {
    const gameData = await getLiveData(); 
    const allPlayers = gameData.allPlayers;
    const currentTime = getGameTimeSeconds(); 

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamOrderBaron = gameData.events.Events 
        .some(event => event.EventName === "BaronKill" && 
                       (currentTime - event.EventTime <= 150) && 
                       allPlayers.some(player => player.team === 'ORDER'));

    return teamOrderBaron ? 1 : 0;
}

async function getChaosBaron() {
    const gameData = await getLiveData(); 
    const allPlayers = gameData.allPlayers; 
    const currentTime = getGameTimeSeconds();

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamChaosBaron = gameData.events.Events 
        .some(event => event.EventName === "BaronKill" && 
                       (currentTime - event.EventTime <= 150) && 
                       allPlayers.some(player => player.team === 'CHAOS'));

    return teamChaosBaron ? 1 : 0;
}

// Calculate Elder taken
async function getOrderElder() {
    const gameData = await getLiveData(); 
    const allPlayers = gameData.allPlayers;
    const currentTime = getGameTimeSeconds(); 

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamOrderElder = gameData.events.Events 
        .some(event => event.EventName === "ElderKill" && 
                       (currentTime - event.EventTime <= 150) && 
                       allPlayers.some(player => player.team === 'ORDER'));

    return teamOrderElder ? 1 : 0;
}

async function getChaosElder() {
    const gameData = await getLiveData(); 
    const allPlayers = gameData.allPlayers; 
    const currentTime = getGameTimeSeconds();

    if (!allPlayers) {
        console.error('No players found in game data');
        return false; 
    }
    
    const teamChaosElder = gameData.events.Events 
        .some(event => event.EventName === "ElderKill" && 
                       (currentTime - event.EventTime <= 150) && 
                       allPlayers.some(player => player.team === 'CHAOS'));

    return teamChaosElder ? 1 : 0;
}


// Calculate win probability based on differences
async function calculateWinProbability() {
    
    const activePlayerTeam = getActivePlayerTeam();
    const orderkills = await getOrderKills();
    const chaosKills = await getChaosKills();
    const totalKills = orderkills + chaosKills;
    const killsRatio = activePlayerTeam === 'ORDER' ? orderkills / totalKills : chaosKills / totalKills;
    const orderDeaths = await getOrderDeaths();
    const chaosDeaths = await getChaosDeaths();
    const totalDeaths = orderDeaths + chaosDeaths;
    const deathsRatio = activePlayerTeam === 'ORDER' ? orderDeaths / totalDeaths : chaosDeaths / totalDeaths;
    const orderAssists = await getOrderAssists();
    const chaosAssists = await getChaosAssists();
    const totalAssists  = orderAssists + chaosAssists;
    const assistsRatio = activePlayerTeam === 'ORDER' ? orderAssists / totalAssists : chaosAssists / totalAssists;
    const orderCS = await getOrderCS();
    const chaosCS = await getChaosCS();
    const totalCS = orderCS + chaosCS;
    const cSRatio = activePlayerTeam === 'ORDER' ? orderCS / totalCS : chaosCS / totalCS;
    const orderLevels = await getOrderLevels();
    const chaosLevels = await getChaosLevels();
    const totalLevels = orderLevels + chaosLevels
    const levelsRatio = activePlayerTeam === 'ORDER' ? orderLevels / totalLevels : chaosLevels / totalLevels;
    const orderGold = await getOrderGold();
    const chaosGold = await getChaosGold();
    const totalGold = orderGold + chaosGold;
    const goldRatio = activePlayerTeam === 'ORDER' ? orderGold / totalGold : chaosGold / totalGold;
    const orderDragon = await getOrderDragon();
    const chaosDragon = await getChaosDragon();
    const totalDragon = orderDragon + chaosDragon;
    const dragonRatio = activePlayerTeam === 'ORDER' ? orderDragon / totalDragon : chaosDragon / totalDragon;
    const dragonSoul = activePlayerTeam === 'ORDER' ? orderDragon >= 4 : chaosDragon >= 4;
    const orderBaron = await getOrderBaron();
    const chaosBaron = await getChaosBaron();
    const orderElder = await getOrderElder();
    const chaosElder = await getChaosElder();
    const gameTime = await getGameTimeSeconds();
    

    //activePlayerTeam === 'ORDER' ? teamOrderCS - teamChaosCS : teamChaosCS - teamOrderCS;
    //https://github.com/Anndrey24/LoL_Win_Probability_Prediction/blob/main/Win_Predictor.ipynb
    // Factors to weigh each stat's importance in calculating win probability
    const weights = {
        kills: 0.25,
        deaths: 0.3,
        assists: .21,
        cs: 0.4,
        gold: 0.4,
        time: .00001,
        dragon: .05,
        dragonSoul: .5,
        levels: .2
    };
    
    // Calculate weighted sum for win probability
const winScore = (
    killsRatio * weights.kills +
    assistsRatio * weights.assists +
    cSRatio * weights.cs +
    levelsRatio * weights.levels +
    goldRatio * weights.gold 
    //+dragonRatio * weights.dragon 
    //+dragonSoul * weights.dragonSoul
    //+ gameTime * weights.time
);

/* Win probability thoughts
need active player team gold / total game gold
game time in seconds
avg team level / avg level in game
turrets killed / total turrets killed in game
dragons taken / total dragons taken in game
barons taken / total barons in game */

// Normalize to a probability between 0 and 1
const winProbability = winScore


    console.log("win prob:", winProbability)

    return (winProbability * 100).toFixed(2); // Return as a percentage
}

// Update all stats differences, including win probability, and display in the DOM
async function updateAllStatsInDOM() {
    const activePlayerTeam = getActivePlayerTeam();
    const orderkills = await getOrderKills();
    const chaosKills = await getChaosKills();
    const orderdeaths = await getOrderDeaths();
    const chaosdeaths = await getChaosDeaths();
    const orderAssists = await getOrderAssists();
    const chaosAssists = await getChaosAssists();
    const orderCS = await getOrderCS();
    const chaosCS = await getChaosCS();
    const orderGold = await getOrderGold();
    const chaosGold = await getChaosGold();
    const orderDragon = await getOrderDragon();
    const chaosDragon = await getChaosDragon();
    const gameTime = await getGameTime();
    const winProbability = await calculateWinProbability();

    const statsHtml = `
        <h2>${activePlayerTeam === 'ORDER' ? 'Blue team' : 'Red team'}</h2>
        <p>Game Time: ${gameTime}</p>
        <p>${orderkills} :K: ${chaosKills}</p>
        <p>${orderdeaths} :D: ${chaosdeaths}</p>
        <p>${orderAssists} :A: ${chaosAssists}</p>
        <p>${orderCS} :CS: ${chaosCS}</p>
        <p>${orderGold} :Item Gold: ${chaosGold}</p>
        <p>Win Probability: ${winProbability}%</p>
    `;
    updateTeamStatsInDOM(statsHtml);
}

// Function to display data in the DOM
function updateTeamStatsInDOM(statsHtml) {
    const statsElement = document.getElementById('compare-team-stats');
    if (statsElement) {
        statsElement.innerHTML = statsHtml;
    } else {
        console.error('Element with ID "compare-team-stats" not found.');
    }
}

// Event listener to fetch data and update stats after page load
document.addEventListener('DOMContentLoaded', () => {
    gameInformation();
    updateAllStatsInDOM();
});