// Simple script to create a base64 PNG icon
import fs from 'fs';

// Create a simple 128x128 PNG with blue background
// This is a minimal PNG file (base64 encoded)
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAADtUlEQVR4nO3dS4hcVRQG4H+6O+lOYhKNiUZjfCAqKLgQBBeCCxVBRRBBcKG4cSWIILhxI7hQQXDhQnChiAsRRBBBBBFEEEEEEUQQQQQRfCQxJpkkncyc45zqW9WdTuqeW/fVVef74EJIp6frnP+cW6fu7RuJiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIqH9tAFsBbAfwKoB3AHwO4AsAXwH4GsA3AL4F8B2A7wH8AOBHAEsAfgLwM4BfAPwK4DcAvwP4A8CfAP4C8DeAvwH8A+BfAKsA1gCsA/gPwH8eExkYM3OPAexL4xZIx+MADgB4EsBuANcDuBbAbACzCcy+r03gb/Mdb2EH4EYAtwLYB+AAgEMA9gN4DMCz/ryInX8UwH0AdgG4TcbOzhcBsNV/I+ynmT/aowBuBnCXjJ1/AsCDAPYC2APgXgCPA3gBwIsAXgLwshq5fK4e1WNVj10J2wbgegA3/d9ZlMnj/HlUx/1HNW75XD1Xz9Vz9Vr9Fr+//ot4Lz6Lz+Sz+Ww+m8/ns/t+LqS/AIcBHARwJ4DbAewEcL1MjOo/vFovYvf/Bxkt4jP5TD6bz+az+Xy+hq/ha/gqv5avJWwbgNt0Iu/N/58k7ABwvV7bV/O1fC1fy9fytXwtX8vX8rV8LV/b9+uuTQC29OC1tgLYCeAaAFcDuArAlQCuSGAmYPPzVY/RL7dK2P83JON3CBMREZ1DKwCe/IddKr+H77LXyMq1/wPocl8wddO8MN3jZPYr0FnP2OdzpbzwNXx/bh+A/QAeAvC4fB21H8BDAx4LJVrKYwnT10eT+1o/ivfL8bl81uTVVwPwAoB9AO5JYM8A2Nuj8Tn7CtjP6bP4LL6DryZsH4DdffiS57v/UwBP99n5Yz5rMp/NZwd8FwD42Tpjqb+S/W/hXgBfAvgWwPcSZuwHf96v8/ls/p59PJd3AG4GsB/A4wCe/x/g/H/Pr/P7KvYbfvr0nSfgtbwtX+PvQcbO7/0P3jOA11LrEhPnr6Xw3hPwj/S/eM/o/m8pv0mYuf+lJvA3gP8ArAJYT+G9J+C/N5uc//9vW2vuAHANgKvTmDz+X/W5qvp17K8AhgB8BWC7hM1OwCQdZ+bM/Z/NzALlM/ks/u5wMI0dy+fymXz2eB6bjefy+Xw+n89n89k0Q0RERERERERERERERERERERERERERERERETDZwPNpZjJQbphdwAAAABJRU5ErkJggg==';

const buffer = Buffer.from(pngBase64, 'base64');
fs.writeFileSync('./public/icons/icon128.png', buffer);

console.log('Icon created successfully!');
