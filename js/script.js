const sampleRobots = [
    { id: 'R001', name: 'BeeBot-1', temperature: 22.5, latitude: 44.50, longitude: -123.50, battery: 85, water: 1.2, lastCharge: '2025-08-04 08:00', status: 'Active', historyBat: [80, 82, 84, 85, 83, 82, 85], videoUrl: 'videos/forest1.mp4' },
    { id: 'R002', name: 'BeeBot-2', temperature: 23.0, latitude: 44.51, longitude: -123.49, battery: 60, water: 0.8, lastCharge: '2025-08-04 07:30', status: 'Low Battery', historyBat: [85, 76, 75, 70, 67, 65, 60], videoUrl: 'videos/forest2.mp4' },
    { id: 'R003', name: 'WaspBot-1', temperature: 21.8, latitude: 44.49, longitude: -123.51, battery: 95, water: 1.5, lastCharge: '2025-08-04 08:15', status: 'Active', historyBat: [70, 82, 83, 84, 85, 90, 95], videoUrl: 'videos/forest3.mp4' },
    { id: 'R004', name: 'WaspBot-2', temperature: 21.5, latitude: 44.47, longitude: -123.47, battery: 30, water: 1.3, lastCharge: '2025-08-04 08:11', status: 'Low Battery', historyBat: [60, 55, 50, 52, 34, 32, 30], videoUrl: 'videos/forest4.mp4' },
    { id: 'R005', name: 'AntBot-1', temperature: 20.5, latitude: 44.48, longitude: -123.44, battery: 20, water: 1.2, lastCharge: '2025-08-04 08:12', status: 'Low Battery', historyBat: [55, 51, 46, 40, 34, 30, 20], videoUrl: 'videos/forest2.mp4' },
    { id: 'R006', name: 'AntBot-2', temperature: 22.6, latitude: 44.46, longitude: -123.42, battery: 10, water: 0.3, lastCharge: '2025-08-04 08:05', status: 'Alarm Battery', historyBat: [74, 62, 53, 43, 30, 20, 10], videoUrl: 'videos/forest3.mp4' }
];

const robots = {};

const map = L.map('map').setView([44.5, -123.5], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
}).addTo(map);

let batteryChart = null;
const ctx = document.getElementById('batteryChart')?.getContext('2d');
if (ctx) {
    console.log('Canvas found, checking Chart.js');
    if (typeof Chart !== 'undefined') {
        console.log('Initializing Chart.js');
        try {
            batteryChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['T-4', 'T-3', 'T-2', 'T-1', 'Now'],
                    datasets: sampleRobots.map(robot => ({
                        label: robot.name,
                        data: robot.historyBat,
                        borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                        fill: false,
                        tension: 0.9
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        //padding: 10 // Add padding for y-axis space
                    },
                    scales: {
                        x: { 
                            title: { display: true, text: 'Time' },
                            position: 'bottom'
                        },
                        y: { 
                            title: { display: true, text: 'Battery (%)' },
                            min: 0,
                            max: 100
                        }
                    }
                }
            });
            console.log('Chart initialized successfully');
        } catch (e) {
            console.error('Chart initialization failed:', e);
        }
    } else {
        console.error('Chart.js not loaded, check CDN: https://cdn.jsdelivr.net/npm/chart.js');
    }
} else {
    console.error('Battery chart canvas not found');
}

function updateRobotData(robot) {
    console.log('Updating robot:', robot.id);
    robots[robot.id] = robot;
    const tableBody = document.getElementById('robotTable');
    if (!tableBody) {
        console.error('robotTable element not found');
        return;
    }
    tableBody.innerHTML = '';
    console.log('Populating table with', Object.values(robots).length, 'robots');
    Object.values(robots).forEach(r => {
        console.log('Rendering row for:', r.name);
        const robotType = r.name.startsWith('BeeBot') ? 'BeeBot' : r.name.startsWith('WaspBot') ? 'WaspBot' : 'AntBot';
        const robotImage = robotType === 'BeeBot' ? 'https://media.istockphoto.com/id/1396407304/photo/insects-of-europe-bees-side-view-macro-of-western-honey-bee-isolated-on-white-background-with.jpg?s=612x612&w=0&k=20&c=CznXV-eUnw9wH728XB7DvTanssBmCPBrQSCB2p7pnuE=' :
                          robotType === 'WaspBot' ? 'https://pestworldcdn-dcf2a8gbggazaghf.z01.azurefd.net/media/561912/paper-wasp-no-text.jpg?width=1200&height=900&v=1d9ba6b3cdca360' :
                          'https://i.pinimg.com/736x/6d/76/b5/6d76b5e7d830d875ed78744b528b02a8.jpg';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-1 sm:p-2"><img src="${robotImage}" alt="${robotType}" title="${robotType}" onerror="this.src='https://via.placeholder.com/32?text=Error'; console.error('Failed to load image for ${robotType}: ${this.src}')"></td>
            <td class="p-1 sm:p-2">${r.id}</td>
            <td class="p-1 sm:p-2">${r.name}</td>
            <td class="p-1 sm:p-2">${r.temperature}</td>
            <td class="p-1 sm:p-2">${r.latitude}, ${r.longitude}</td>
            <td class="p-1 sm:p-2">${r.battery}</td>
            <td class="p-1 sm:p-2">${r.water}</td>
            <td class="p-1 sm:p-2">${r.lastCharge}</td>
            <td class="p-1 sm:p-2">${r.status}</td>
        `;
        row.dataset.robotId = r.id;
        row.addEventListener('click', () => showVideo(r));
        tableBody.appendChild(row);

        if (r.marker) map.removeLayer(r.marker);
        r.marker = L.marker([r.latitude, r.longitude]).addTo(map)
            .bindPopup(`<b>${r.name}</b><br>Temp: ${r.temperature}°C<br>Battery: ${r.battery}%<br>Status: ${r.status}`);
        
        if (batteryChart) {
            let dataset = batteryChart.data.datasets.find(ds => ds.label === r.name);
            if (!dataset) {
                dataset = {
                    label: r.name,
                    data: r.historyBat,
                    borderColor: `hsl(${Math.random() * 360}, 70%, 30%)`,
                    fill: false,
                    tension: 0.4
                };
                batteryChart.data.datasets.push(dataset);
            } else {
                dataset.data.push(r.battery);
                if (dataset.data.length > 20) {
                    dataset.data.shift();
                    if (batteryChart.data.labels.length > 20) batteryChart.data.labels.shift();
                }
            }
            batteryChart.update();
            console.log('Chart updated for:', r.name);
        }
    });
}

function showVideo(robot) {
    console.log('Showing video for:', robot.name);
    const videoSection = document.getElementById('videoSection');
    const videoTitle = document.getElementById('videoTitle');
    const videoFrame = document.getElementById('videoFrame');
    if (!videoSection || !videoTitle || !videoFrame) {
        console.error('Video section elements not found');
        return;
    }
    videoTitle.textContent = `${robot.name} Video Feed`;
    const source = videoFrame.querySelector('source');
    source.src = robot.videoUrl;
    videoFrame.load();
    videoFrame.play().catch(e => console.error('Video autoplay failed:', e));
    videoSection.classList.remove('hidden');
    console.log('Video section display style:', window.getComputedStyle(videoSection).display);
    console.log('Video source path:', source.src, 'Video readyState:', videoFrame.readyState);
}

// Initialize with the first robot's video
console.log('Loading initial video for BeeBot-1');
showVideo(sampleRobots[0]);

console.log('Initializing with sample robots');
sampleRobots.forEach(robot => updateRobotData(robot));