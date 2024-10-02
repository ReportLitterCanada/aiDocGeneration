# Project Setup and Deployment Guide

## Cloning the Repository

1. **Clone the GitHub Repository**:
   - Go to the GitHub repository page.
   - Click the green "Code" button.
   - Open with GitHub Desktop.

## Setting Up Locally

2. **Navigate to Project Directory**:
   - Open your terminal or command prompt.
   - Change directory to your local project path using the `cd` command. For example:
     ```sh
     cd path/to/your/local/project
     ```

3. **Install Dependencies**:
   - Run the following command to install project dependencies:
     ```sh
     npm install
     ```

4. **Run the Project Locally**:
   - Start the project by running:
     ```sh
     node app.js
     ```
   - Ensure that the configured port (3000 in this case) is not occupied by another process.

## Deployment to Vercel

5. **Install Vercel CLI**:
   - Open a command prompt terminal in your code editor (e.g., Visual Studio Code).
   - In your terminal, use the following command to install the Vercel CLI globally:
     ```sh
     npm install -g vercel
     ```

6. **Deploy the Project**:
   - Deploy your project to Vercel by running:
     ```sh
     vercel --prod
     ```

   - Follow any additional prompts provided by the Vercel CLI to complete the deployment.
