import React from 'react'
import Card from 'react-bootstrap/Card';

const Guessr = () => {
    
    return (
        <div className="guessr">
            
            <div className="mx-1 my-1">
                <h1>Guessr</h1>
            </div>
            
            <Card style={{ width: '50rem' }} className="mx-1 my-1">
                <Card.Body>
                    <Card.Title>Guessr</Card.Title>
                    <Card.Subtitle className="mb-1 text-muted"> Guess where the movie is filmed. 
                                                                The closer you are, the more points you get.
                    </Card.Subtitle>
                </Card.Body>
            </Card>

            <div className="d-flex justify-content-center align-items-center vh-100">
                <Card style={{ width: "50rem" }}>
                    <Card.Body>
                    <Card.Title>This is where the game is going</Card.Title>
                    </Card.Body>
                </Card>
            </div>
            
        </div>

        
    )
}

export default Guessr;
