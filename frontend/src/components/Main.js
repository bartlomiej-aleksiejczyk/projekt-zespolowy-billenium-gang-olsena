import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import styled, {createGlobalStyle} from 'styled-components';
import React, {useState, useEffect} from 'react';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';
import Board from "./Board";
import {Button} from 'primereact/button';
import 'primeflex/primeflex.css';
import {ConfirmDialog} from 'primereact/confirmdialog';
import {InputText} from 'primereact/inputtext';
import ApiService from "../services/ApiService";
import CommonService from "../services/CommonService";

const GlobalStyle = createGlobalStyle`
  body {
    box-sizing: border-box;
    font-family: Verdana;
    color: #232323;
    background-color: #aec5de;
    /*
    background-color: #a2c0e0;
    */

    scroll-margin-left: 0;
  }
`

const BoardOfBoards = styled.div`
  display: flex;
  margin-left:280px;
  justify-content: space-around;
  position: absolute;
`;
const Header = styled.h1`
  text-shadow: 3px 3px #4f46e5;
  margin-left: 35px;
  margin-top: 35px;
  font-size: 350%;
  width: 100%;
  position: fixed;
  text-transform: uppercase;
  padding: 5px;
  color: #ffffff;
`;
const WholeWebpage = styled.div`
`;

function Main() {
    const [boards, setBoards] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/board/', {
            method: 'GET'
        },)
            .then(response => response.json())
            .then(response_data => setBoards(response_data.data));
    }, []);

    async function onDragEnd(result) {
        const {destination, source, draggableId} = result;
        const draggableIde = draggableId.slice(0, -1)
        if(!destination) return;
        if(destination.droppableId === source.droppableId && destination.index === source.index) return;
        if(result.type === "board") {
            let board = {...boards[(source.index)]};
            boards.splice(source.index, 1);
            boards.splice(destination.index, 0, board);
            setBoards(boards);
            await ApiService.moveBoard(draggableIde, destination.index).then((response_data) => {
                CommonService.toastCallback(response_data, setBoards)
            });
            ;
        } else if(result.type === "card") {
            let boardIndex = parseInt(((destination.droppableId)).slice(-1));
            let rowIndex = parseInt((destination.droppableId).slice(0, -1))
            let board = boards[boardIndex];
            let row = (board.row_data)[rowIndex];
            let cards = row.card_data;
            let boardIndexSource = parseInt(((source.droppableId)).slice(-1));
            let rowIndexSource = parseInt((source.droppableId).slice(0, -1))
            let source_card = {...boards[boardIndexSource].row_data[rowIndexSource].card_data[source.index]};
            let destination_card = {...boards[boardIndex]};
            boards[boardIndexSource].row_data[rowIndexSource].card_data.splice(source.index, 1);
            boards[boardIndex].row_data[rowIndex].card_data.splice(destination.index, 0, source_card);
            boards[boardIndex].row_data[rowIndex].card_data[destination.index].board = destination_card.id;
            setBoards(boards);


            if(cards.length - 1 < destination.index) {
                await ApiService.moveCard(draggableIde, cards.length, board.id, row.id).then((response_data) => {
                    CommonService.toastCallback(response_data, setBoards)
                });
            } else {
                await ApiService.moveCard(draggableIde, destination.index, board.id,row.id).then((response_data) => {
                    CommonService.toastCallback(response_data, setBoards)
                });
            }
        }
    }

    const acceptAddBoard = () => {
        ApiService.newBoard(value).then((response_data) => {
            CommonService.toastCallback(response_data, setBoards);
            setValue('');
        });
    }
    const rejectAddBoard = () => {
        setValue('');
    }
    const acceptAddRow = () => {
        ApiService.newRow(value1).then((response_data) => {
            CommonService.toastCallback(response_data, setBoards);
            setValue('');
        });
    }
    const rejectAddRow = () => {
        setValue('');
    }
    const [visible, setVisible] = useState(false);
    const [value, setValue] = useState('');
    const [visible1, setVisible1] = useState(false);
    const [value1, setValue1] = useState('');
    return (
        <WholeWebpage>
            <Header>Kanban Board</Header>
            <ConfirmDialog
                visible={visible}
                onHide={() => setVisible(false)}
                message={<InputText value={value} onChange={(e) => setValue(e.target.value)}/>}
                header="Wpisz nazwe kolumny:"
                icon="pi pi-table"
                acceptLabel="Akceptuj"
                rejectLabel="Odrzu??"
                accept={acceptAddBoard}
                reject={rejectAddBoard}
            />
            <ConfirmDialog
                visible={visible1}
                onHide={() => setVisible1(false)}
                message={<InputText value1={value} onChange={(e) => setValue1(e.target.value)}/>}
                header="Wpisz nazwe rz??du:"
                icon="pi pi-table"
                acceptLabel="Akceptuj"
                rejectLabel="Odrzu??"
                accept={acceptAddRow}
                reject={rejectAddRow}
            />
            <Button style={{
                position : "fixed",
                zIndex   : "1",
                right    : "30px",
                top      : "41px",
                boxShadow: "0px 1px 7px rgba(0, 0, 0, 0.1), 0px 4px 5px -2px rgba(0, 0, 0, 0.12), 0px 10px 15px -5px rgba(0, 0, 0, 0.2)"
            }}
                    size="lg"
                    onClick={() => CommonService.onOpenDialog(setVisible, setValue, '')}
                    label="Nowa kolumna"
                    icon="pi pi-plus"/>
            <Button style={{
                position : "fixed",
                zIndex   : "1",
                right    : "270px",
                top      : "41px",
                boxShadow: "0px 1px 7px rgba(0, 0, 0, 0.1), 0px 4px 5px -2px rgba(0, 0, 0, 0.12), 0px 10px 15px -5px rgba(0, 0, 0, 0.2)"
            }}
                    size="lg"
                    onClick={() => CommonService.onOpenDialog(setVisible1, setValue1, '')}
                    label="Nowy rz??d"
                    icon="pi pi-plus"/>
            <GlobalStyle whiteColor/>
            <DragDropContext
                onDragEnd={onDragEnd}>
                <Droppable
                    key="unikalnyKlucz1"
                    droppableId="all-columns"
                    direction="horizontal"
                    type="board"
                    disabledDroppable={true}
                >
                    {provided => (
                        <BoardOfBoards
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {boards.map((board, index) => {
                                return <Board key={board.id}
                                              backId={board.id}
                                              dragId={(board.id).toString() + "b"}
                                              column={board}
                                              rows={board.row_data}
                                              boards={boards}
                                              board={board}
                                              name={board.name}
                                              limit={board.max_card}
                                              is_static={board.is_static}
                                              setBoards={setBoards}
                                              index={index}/>
                            })}
                            {provided.placeholder}
                        </BoardOfBoards>
                    )}
                </Droppable>
            </DragDropContext>
        </WholeWebpage>
    )
}

export default Main