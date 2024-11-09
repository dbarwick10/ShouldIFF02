//import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateWinProbability } from '../features/winProbability.js'

const ctx = document.getElementById('myChart').getContext('2d');
        const gameStartTime = Date.now();
        let probabilityData = [];

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Win Probability',
                    data: [],
                    borderColor: 'rgb(37, 99, 235)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => `${value}%`
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 10
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => `Win Probability: ${context.parsed.y.toFixed(1)}%`
                        }
                    }
                }
            }
        });

        // Function to format time as MM:SS
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        // Function to update chart data
        export async function updateChart() {
            try {
                const winProbability = await calculateWinProbability();
                const timeElapsed = Math.floor((Date.now() - gameStartTime) / 1000);
                const timeLabel = formatTime(timeElapsed);

                // Add new data point
                probabilityData.push({
                    time: timeLabel,
                    probability: parseFloat(winProbability),
                    timeInSeconds: timeElapsed
                });

                // Keep only last 20 minutes of data (1200 seconds)
                probabilityData = probabilityData.filter(d => 
                    timeElapsed - d.timeInSeconds <= 1200
                );

                // Update chart
                chart.data.labels = probabilityData.map(d => d.time);
                chart.data.datasets[0].data = probabilityData.map(d => d.probability);
                chart.update('none'); // Update without animation for performance
            } catch (error) {
                console.error('Error updating win probability:', error);
            }
        }

        // Update every 5 seconds
        setInterval(updateChart, 5000);
        
        // Initial update
        updateChart();