
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
    const activePlayerTeam = getActivePlayerTeam();

    // Update the header with the totals
    if (teamTableId === 'order-list') {
    teamHeader.innerHTML = `
        <th>Item Gold (${totalGold})</th>
        <th>CS (${totalCS})</th>
        <th>K/D/A (${totalKills}/${totalDeaths}/${totalAssists})</th>
        <th>Level</th>
        <th>Champion</th>
        <th>${activePlayerTeam === 'ORDER' ? 'Red Team' : 'Blue Team'} Player</th>
    `;
    } else if (teamTableId === 'chaos-list') {
        teamHeader.innerHTML = `
            <th> ${activePlayerTeam === 'CHAOS' ? 'Blue Team' : 'Red Team'} Player</th>
            <th>Champion</th>
            <th>Level</th>
            <th>K/D/A (${totalKills}/${totalDeaths}/${totalAssists})</th>
            <th>CS (${totalCS})</th>
            <th>Item Gold (${totalGold})</th>
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

        teamTable.appendChild(row);  // Append each player's stats
    });
}

// Fetch and display live game data
async function gameInformation() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

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
        return acc + (isNaN(itemPrice) ? 0 : itemPrice);  // Fallback to 0 if price is NaN
    }, 0);
    
    const currentGold = parseFloat(player.currentGold);
    
    return Math.floor(itemsGold + (isNaN(currentGold) ? 0 : currentGold));  // Fallback to 0 if currentGold is NaN
}

async function getGameTime() {
    const gameTimeData = await getLiveData(); // Assuming this returns the full game data
    const time = gameTimeData.gameData.gameTime
    const minutes = Math.floor(time / 60)
    const seconds = (time % 60).toFixed(0)
    const gameTime = `${minutes}m ${seconds}s`

    console.log("game time::", gameTime);
    return gameTime
}

// Calculate kills difference
async function getPlayerKillsDifference() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamChaosKills = allPlayers
        .filter(player => player.team === 'CHAOS') // Accessing player.team
        .reduce((total, player) => total + player.scores.kills, 0); // Accessing player.scores.kills

    const teamOrderKills = allPlayers
        .filter(player => player.team === 'ORDER') // Accessing player.team
        .reduce((total, player) => total + player.scores.kills, 0); // Accessing player.scores.kills

    console.log("Team Order Kills:", teamOrderKills);  // Log kills for debugging
    console.log("Team Chaos Kills:", teamChaosKills);

    const activePlayerTeam = await getActivePlayerTeam(); // Get the active player's team
    return activePlayerTeam === 'ORDER' ? teamOrderKills - teamChaosKills : teamChaosKills - teamOrderKills;
}

// Calculate deaths difference
async function getPlayerDeathsDifference() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }
    const teamChaosDeaths = allPlayers
        .filter(player => player.team === 'CHAOS')
        .reduce((total, player) => total + player.scores.deaths, 0);
    
    const teamOrderDeaths = allPlayers
        .filter(player => player.team === 'ORDER')
        .reduce((total, player) => total + player.scores.deaths, 0);

    console.log("Team Order Deaths:", teamOrderDeaths);  // Log kills for debugging
    console.log("Team Chaos Deaths:", teamChaosDeaths);

    const activePlayerTeam = await getActivePlayerTeam(); // Get the active player's team
    return activePlayerTeam === 'ORDER' ? teamOrderDeaths - teamChaosDeaths : teamChaosDeaths - teamOrderDeaths;
    
    
}

// Calculate assists difference
async function getPlayerAssistsDifference() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamChaosAssists = allPlayers
        .filter(player => player.team === 'CHAOS')
        .reduce((total, player) => total + player.scores.assists, 0);
    
    const teamOrderAssists = allPlayers
        .filter(player => player.team === 'ORDER')
        .reduce((total, player) => total + player.scores.assists, 0);

    console.log("Team Order Assists:", teamOrderAssists);  // Log kills for debugging
    console.log("Team Chaos Assists:", teamChaosAssists);

    const activePlayerTeam = await getActivePlayerTeam(); // Get the active player's team
    return activePlayerTeam === 'ORDER' ? teamOrderAssists - teamChaosAssists : teamChaosAssists - teamOrderAssists;
}

// Calculate CS difference
async function getPlayerCSDifference() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamChaosCS = allPlayers
        .filter(player => player.team === 'CHAOS')
        .reduce((total, player) => total + player.scores.creepScore, 0);
    
    const teamOrderCS = allPlayers
        .filter(player => player.team === 'ORDER')
        .reduce((total, player) => total + player.scores.creepScore, 0);

    console.log("Team Order CS:", teamOrderCS);  // Log kills for debugging
    console.log("Team Chaos CS:", teamChaosCS);

    const activePlayerTeam = await getActivePlayerTeam(); // Get the active player's team
    return activePlayerTeam === 'ORDER' ? teamOrderCS - teamChaosCS : teamChaosCS - teamOrderCS;
}

// Calculate total gold difference
async function getPlayerTotalGoldDifference() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers) {
        console.error('No players found in game data');
        return;
    }

    const teamChaosGold = allPlayers
        .filter(player => player.team === 'CHAOS')
        .reduce((total, player) => total + calculateTotalGold(player), 0);
    
    const teamOrderGold = allPlayers
        .filter(player => player.team === 'ORDER')
        .reduce((total, player) => total + calculateTotalGold(player), 0);

    console.log("Team Order Gold:", teamOrderGold);  // Log kills for debugging
    console.log("Team Chaos Gold:", teamChaosGold);

    const activePlayerTeam = await getActivePlayerTeam(); // Get the active player's team
    return activePlayerTeam === 'ORDER' ? teamOrderGold - teamChaosGold : teamChaosGold - teamOrderGold;
}

// Calculate win probability based on differences
async function calculateWinProbability() {
    const killsDiff = await getPlayerKillsDifference();
    const deathsDiff = await getPlayerDeathsDifference();
    const assistsDiff = await getPlayerAssistsDifference();
    const kda = `${killsDiff}/${deathsDiff}/${assistsDiff}`;
    const csDiff = await getPlayerCSDifference();
    const goldDiff = await getPlayerTotalGoldDifference();

    //https://github.com/Anndrey24/LoL_Win_Probability_Prediction/blob/main/Win_Predictor.ipynb
    // Factors to weigh each stat's importance in calculating win probability
    const weights = {
        kills: 0.6,
        deaths: 0.3,
        assists: 0.4,
        cs: 0.075,
        gold: 0.15
    };
    
    // Calculate weighted sum for win probability
const winScore = (
    (killsDiff * weights.kills +
    assistsDiff * weights.assists) /
    deathsDiff * weights.deaths //+
    //csDiff * weights.cs +
    //goldDiff * weights.gold
);

/* Win probability thoughts
need active player team gold / total game gold
game time in seconds
avg team level / avg level in game
turrets killed / total turrets killed in game
dragons taken / total dragons taken in game
barons taken / total barons in game

*/

// Normalize to a probability between 0 and 1
const winProbability = winScore


    console.log("win prob:", winProbability)

    return (winProbability * 100).toFixed(2); // Return as a percentage
}

// Update all stats differences, including win probability, and display in the DOM
async function updateAllStatsInDOM() {
    const killsDiff = await getPlayerKillsDifference();
    const deathsDiff = await getPlayerDeathsDifference();
    const assistsDiff = await getPlayerAssistsDifference();
    const csDiff = await getPlayerCSDifference();
    const goldDiff = await getPlayerTotalGoldDifference();
    const winProbability = await calculateWinProbability();
    const activePlayerTeam = getActivePlayerTeam();
    const gameTime = await getGameTime();

    const statsHtml = `
        <h2>${activePlayerTeam === 'ORDER' ? 'Blue team' : 'Red team'}</h2>
        <p>Game Time: ${gameTime}</p>
        <p>Kills Difference: ${killsDiff}</p>
        
        <p>Assists Difference: ${assistsDiff}</p>
        <p>CS Difference: ${csDiff}</p>
        <p>Total Item Gold Difference: ${goldDiff}</p>
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