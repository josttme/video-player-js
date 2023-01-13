/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./index.html', './src/**/*.js'],
	theme: {
		extend: {
			colors: {
				primary: '#000019',
				secondary: '#168fff',
				'text-color': '#e6e4e1',
			},
			gridTemplateColumns: {
				// Simple 16 column grid
				volume: '20% , auto',
				sm: '10% , 1fr ,1fr, 1fr, 1fr 1fr , 10% ,10%, 10%',
				lg: '5%, 1fr , 5% , 1fr ,1fr, 1fr, 1fr 1fr , 5% ,5%, 5%',
			},
			backgroundSize: {
				0: '0px',
			},
			dropShadow: {
				'3xl': '0 0 20px rgba(255,255,255,.6)',
			},
		},
	},
	plugins: [],
}
