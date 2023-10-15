from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
from collections import defaultdict
import os

app = FastAPI()

# Enable CORS for all origins (you might want to restrict this in a production environment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TrafficData(BaseModel):
    data: str

def process_data(data: str) -> Dict[str, int]:
    # Assuming CSV format: ip.src,ip.dst,frame.time
    rows = [row.split(',') for row in data.strip().split('\n')]
    
    # Count packets per source IP
    packet_count = defaultdict(int)
    for row in rows:
        src_ip = row[0].strip()
        packet_count[src_ip] += 1

    return dict(packet_count)

@app.post("/traffic")
async def process_traffic(traffic_data: TrafficData):
    try:
        data = traffic_data.data
        result = process_data(data)
                # Get the current working directory
        current_dir = os.getcwd()

        # Construct the full path to the file in the current directory
        # file_path = os.path.join(current_dir, './file.txt')
        file_path = './file.txt'


        # Open the file in write mode
        with open(file_path, "w") as file:
            # Write the content to the file
            file.write(str(result))
        print(result)
        return JSONResponse(content=None, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing data: {e}")
