
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
            <th> ${activePlayerTeam === 'CHAOS' ? 'Blue Team' : 'Red Team'} Player</th>
            <th>Champion</th>
            <th>Level</th>
            <th>K/D/A</th>
            <th>CS</th>
            <th>Item Gold</th>
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
                <td>${player.name}</td>
                <td>${player.champion}</td>
                <td>${player.level}</td>
                <td>${player.kills}/${player.deaths}/${player.assists}</td>
                <td>${player.cs}</td>
                <td>${player.totalGold}</td>
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

// Calculate turrets taken
async function getOrderTurret() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers || !gameData.events || !gameData.events.Events) {
        console.error('Required data not found in game data');
        return;
    }

    const teamOrderPlayers = allPlayers
        .filter(player => player.team === 'ORDER') // Get players on the ORDER team
        .map(player => player.riotIdGameName); // Get their summoner names

    const teamOrderTurret = gameData.events.Events
        .filter(event => 
            event.EventName === "TurretKilled" &&
            (
            teamOrderPlayers.includes(event.KillerName) ||
            event.KillerName.includes("Minion_T100")
            )
        )
        .length;

    return teamOrderTurret;
}

async function getChaosTurret() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers || !gameData.events || !gameData.events.Events) {
        console.error('Required game data not found');
        return 0;
    }

    const teamChaosPlayers = allPlayers
        .filter(player => player.team === 'CHAOS') // Get players on the CHAOS team
        .map(player => player.riotIdGameName); // Get their summoner names

    const teamChaosTurret = gameData.events.Events
        .filter(event => 
            event.EventName === "TurretKilled" &&
            (
            teamChaosPlayers.includes(event.KillerName) || 
            event.KillerName.includes("Minion_T200")
            )
        )
        .length;

    return teamChaosTurret;
}

//get dragon soul
async function getDragonSoul() {
    const gameTimeData = await getLiveData(); 
    const soul = gameTimeData.gameData.mapTerrain
    
    return soul
}

// Calculate dragons taken
async function getOrderDragon() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers || !gameData.events || !gameData.events.Events) {
        console.error('Required game data not found');
        return 0;
    }

    const teamOrderPlayers = allPlayers
        .filter(player => player.team === 'ORDER') // Get players on the CHAOS team
        .map(player => player.riotIdGameName); // Get their summoner names

    const teamOrderDragon = gameData.events.Events
        .filter(event => event.EventName === "DragonKill" &&
            teamOrderPlayers.includes(event.KillerName) // Check if killer is on CHAOS team
        )
        .length;

    return teamOrderDragon;
}

async function getChaosDragon() {
    const gameData = await getLiveData(); // Assuming this returns the full game data
    const allPlayers = gameData.allPlayers; // Assuming players are in allPlayers array

    if (!allPlayers || !gameData.events || !gameData.events.Events) {
        console.error('Required game data not found');
        return 0;
    }

    const teamChaosPlayers = allPlayers
        .filter(player => player.team === 'CHAOS') // Get players on the CHAOS team
        .map(player => player.riotIdGameName); // Get their summoner names

    const teamChaosDragon = gameData.events.Events
        .filter(event => event.EventName === "DragonKill" &&
            teamChaosPlayers.includes(event.KillerName || "Minion_T200") // Check if killer is on CHAOS team
        )
        .length;

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

    const teamOrderPlayers = allPlayers
        .filter(player => player.team === 'ORDER')
        .map(player => player.riotIdGameName); 

    const teamOrderBaron = gameData.events.Events 
        .some(event => event.EventName === "BaronKill" && 
                       (currentTime - event.EventTime <= 150) && 
                       teamOrderPlayers.includes(event.KillerName)
             )
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

    const teamChaosPlayers = allPlayers
        .filter(player => player.team === 'CHAOS')
        .map(player => player.riotIdGameName); 

    const teamChaosBaron = gameData.events.Events 
        .some(event => event.EventName === "BaronKill" && 
                       (currentTime - event.EventTime <= 150) && 
                       teamChaosPlayers.includes(event.KillerName)
             )
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

    const teamOrderPlayers = allPlayers
        .filter(player => player.team === 'ORDER')
        .map(player => player.riotIdGameName); 

    const teamOrderElder = gameData.events.Events 
        .some(event => event.EventName === "ElderKill" && 
                       (currentTime - event.EventTime <= 150) && 
                       teamOrderPlayers.includes(event.KillerName)
        )
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
    
    const teamChaosPlayers = allPlayers
        .filter(player => player.team === 'CHAOS')
        .map(player => player.riotIdGameName); 

    const teamChaosElder = gameData.events.Events 
        .some(event => event.EventName === "ElderKill" && 
                       (currentTime - event.EventTime <= 150) && 
                       teamChaosPlayers.includes(event.KillerName)
        )
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
    const orderTurret = await getOrderTurret();
    const chaosTurret = await getChaosTurret();
    const totalTurret = orderTurret + chaosTurret;
    const turretRatio = activePlayerTeam === 'ORDER' ? orderTurret / totalTurret : chaosTurret / totalTurret;
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
        kills: 0.15,
        deaths: 0.3,
        assists: 0.1,
        cs: 0.2,
        gold: 0.25,
        turret: 0.2,
        time: 0.00001,
        dragon: 0.05,
        dragonSoul: 0.1,
        levels: 0.2
    };
    
    // Calculate weighted sum for win probability
const winScore = (
    killsRatio * weights.kills
    + assistsRatio * weights.assists
    + cSRatio * weights.cs
    + levelsRatio * weights.levels
    + goldRatio * weights.gold 
    + turretRatio * weights.turret 
    + dragonRatio * weights.dragon 
    + dragonSoul * weights.dragonSoul
    + gameTime * weights.time
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
    const dragonSoul = await getDragonSoul();
    const orderTurret = await getOrderTurret();
    const chaosTurret = await getChaosTurret();
    const orderBaronBuff = await getOrderBaron();
    const chaosBaronBuff = await getChaosBaron();
    const orderElderBuff = await getOrderElder();
    const chaosElderBuff = await getChaosElder();
    const gameTime = await getGameTime();
    const winProbability = await calculateWinProbability();

    const statsHtml = `
    <div class="stats-win-container">
    <div class="stats-container">
        <div class="stat-entry"><p class="team-value">${orderkills}</p><p class="stat-name">Kills</p><p class="team-value">${chaosKills}</p></div>
        <div class="stat-entry"><p class="team-value">${orderdeaths}</p><p class="stat-name">Deaths</p><p class="team-value">${chaosdeaths}</p></div>
        <div class="stat-entry"><p class="team-value">${orderAssists}</p><p class="stat-name">Assists</p><p class="team-value">${chaosAssists}</p></div>
        <div class="stat-entry"><p class="team-value">${orderCS}</p><p class="stat-name">CS</p><p class="team-value">${chaosCS}</p></div>
        <div class="stat-entry"><p class="team-value">${orderGold}</p><p class="stat-name">Gold</p><p class="team-value">${chaosGold}</p></div>
        <div class="stat-entry"><p class="team-value">${orderTurret}</p><p class="stat-name">Turrets</p><p class="team-value">${chaosTurret}</p></div>
        <div class="stat-entry"><p class="team-value">${orderDragon}</p><p class="stat-name">Dragons</p><p class="team-value">${chaosDragon}</p></div>
        <div class="stat-entry"><p class="team-value">${orderDragon > 3 ? dragonSoul : false}</p><p class="stat-name">Dragon Soul</p><p class="team-value">${chaosDragon > 3 ? dragonSoul : false}</p></div>
        <div class="stat-entry"><p class="team-value">${orderBaronBuff === 1 ? 'Yes' : 'No'}</p><p class="stat-name">Baron Buff</p><p class="team-value">${chaosBaronBuff === 1 ? 'Yes' : 'No'}</p></div>
        <div class="stat-entry"><p class="team-value">${orderElderBuff === 1 ? 'Yes' : 'No'}</p><p class="stat-name">Elder Buff</p><p class="team-value">${chaosElderBuff === 1 ? 'Yes' : 'No'}</p></div>
    </div>
    <div class="win-container">
    <div class="stat-entry"><p class="stat-name">Win Probability:</p><p class="team-value">${winProbability}%</p></div>
    <div class="should-ff-text">changin the text to test it more more more more more sadfksdfhsdfasf;lh</div>
    </div>
    </div>
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

/* document.addEventListener('DOMContentLoaded', function() {
    // Get the refresh button element
    const refreshButton = document.getElementById('refresh-button');

    // Check if the button exists
    if (refreshButton) {
        // Add a click event listener to the button
        refreshButton.addEventListener('click', function() {
            console.log("refreshed");
            // Uncomment the next line to refresh the page
            // location.reload();
        });
    } else {
        console.error("Refresh button not found!");
    }
}); */
