import { Button, Stack, TextField } from "@mui/material";
import { MainContent } from "./styles";
import { useContext, useEffect } from "react";
import { GameContext } from "../../providers/GameContext";

export default function Home() {
    const {username, target} = useContext(GameContext)

    const handleSubmit = () => {

    }

    return (
        <>
            <MainContent>
                <Stack 
                component="form"
                sx={{
                    width: "95%",
                    maxWidth: "530px",
                    boxShadow: "3px 3px 10px 10px #55555536",
                    padding: "30px",
                    borderRadius: "20px"
                }}
                gap={4}>
                    <TextField label="Your name" variant="outlined" onChange={() => {}}></TextField>
                    <TextField label="Oponent name" variant="outlined" onChange={() => {}}></TextField>
                    <Button variant="outlined" onClick={() => handleSubmit()}>Connect!</Button>
                </Stack>
            </MainContent>
        </>
    )
}