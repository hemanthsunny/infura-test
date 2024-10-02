# Ethereum Block Tracker

This application tracks Ethereum blocks using the Infura API. It allows users to view the latest blocks, toggle the display format of specific fields between decimal and hexadecimal, and delete blocks from the list.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Technical Choices](#technical-choices)

## Features

- Fetch and display the latest Ethereum blocks.
- Toggle the size, number, and gasLimit fields between decimal and hexadecimal formats.
- Delete blocks individually or clear the entire list.

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js with Express
- **MongoDBAtlas**: For storing block data.
- **Axios**: For making HTTP requests.

## Installation

- **Frontend**:
  - `cd fe`
  - `npm install`
  - `npm start`
- **Backend**:
  - `cd be`
  - `npm install`
  - `npm run dev`

### Prerequisites

- Node.js (>= 21.x)
- MongoDB Atlas
- Infura account (to obtain a project ID)

Otherwise, use existing variables as no ENV file created.

### API Endpoints

1. GET `/blocks`: Retrieve all blocks stored in the database.
2. DELETE `/blocks/:number`: Delete a specific block by block number.
3. DELETE `/blocks`: Clear all blocks from the database.

### Technical Choices

- ReactJS: Chosen for building application UI.
- Express: Chosen for building a RESTful API for the application.
- MongoDB: Utilized for data storage, allowing persistence of block data across sessions.
