import { Environment, Grid, OrbitControls, useCursor } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useAtom } from "jotai";
import { Suspense, useEffect, useRef, useState } from "react";
import { useGrid } from "../hooks/useGrid";
import { Avatar } from "./Avatar";
import { Item } from "./Item";
import { Shop } from "./Shop";
import { charactersAtom, mapAtom, socket, userAtom } from "./SocketManager";
import {
  buildModeAtom,
  draggedItemAtom,
  draggedItemRotationAtom,
  shopModeAtom,
} from "./UI";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { contractABI, contractAddress, setCoordinates } from "../utils/utils";
import { useWalletInterface } from "../services/wallets/useWalletInterface";
export const Experience = ({ onFrameClick}) => {
  const [buildMode, setBuildMode] = useAtom(buildModeAtom);
  const [shopMode, setShopMode] = useAtom(shopModeAtom);
  const [characters] = useAtom(charactersAtom);
  const [map] = useAtom(mapAtom);
  const [items, setItems] = useState(map?.items || []);
  const [onFloor, setOnFloor] = useState(false);
  useCursor(onFloor);
  const { vector3ToGrid, gridToVector3 } = useGrid();
  const { accountId, walletInterface } = useWalletInterface();
  const scene = useThree((state) => state.scene);
  const [user] = useAtom(userAtom);
  useEffect(() => {
    if(map && map.items && map.items.length && map.items.length > 0 ){
      setItems(map.items)
    }
  },[map])
  const onPlaneClicked = async(e) => {
    if (!buildMode) {
      console.log("Not in build mode");
      const character = scene.getObjectByName(`character-${user}`);
      if (!character) {
        return;
      }
      socket.emit(
        "move",
        vector3ToGrid(character.position),
        vector3ToGrid(e.point)
      );
    } else {
      if (draggedItem !== null) {
        console.log("In build mode", draggedItem);
        if (canDrop) {
          console.log("Item can be dropped");
          setItems((prev) => {
            const newItems = [...prev];
            delete newItems[draggedItem].tmp;
            newItems[draggedItem].gridPosition = vector3ToGrid(e.point);
            newItems[draggedItem].rotation = draggedItemRotation;
            return newItems;
          });
        }
        console.log("Ghus rha h ")
        const newItems = items;
        console.log(newItems[draggedItem])
        // need to update blockchain coordinates here
        setDraggedItem(null);
        const params = [newItems[draggedItem].id, newItems[draggedItem].gridPosition[0], newItems[draggedItem].gridPosition[1], newItems[draggedItem].rotation]
        
        if (!walletInterface) {
          toast.error("Please connect your wallet first");
          return;
        }
        
        // TODO: Implement contract interaction with wallet interface
        console.log("Set coordinates - Params:", params);
        toast.info("Contract interaction not yet implemented");
      }
    }
  };

  const [draggedItem, setDraggedItem] = useAtom(draggedItemAtom);
  const [draggedItemRotation, setDraggedItemRotation] = useAtom(
    draggedItemRotationAtom
  );
  const [dragPosition, setDragPosition] = useState([0, 0]);
  const [canDrop, setCanDrop] = useState(false);

  useEffect(() => {
    if (draggedItem === null) {
      setItems((prev) => prev.filter((item) => !item.tmp));
    }
  }, [draggedItem]);

  useEffect(() => {
    if (draggedItem === null) {
      // FIXED: issue with 0 being falsy
      return;
    }
    const item = items[draggedItem];
    const width =
      draggedItemRotation === 1 || draggedItemRotation === 3
        ? item.size[1]
        : item.size[0];
    const height =
      draggedItemRotation === 1 || draggedItemRotation === 3
        ? item.size[0]
        : item.size[1];

    let droppable = true;

    // check if item is in bounds
    if (
      dragPosition[0] < 0 ||
      dragPosition[0] + width > (map?.size?.[0] || 0) * (map?.gridDivision || 1)
    ) {
      droppable = false;
    }
    if (
      dragPosition[1] < 0 ||
      dragPosition[1] + height > (map?.size?.[1] || 0) * (map?.gridDivision || 1)
    ) {
      droppable = false;
    }
    // check if item is not colliding with other items
    if (!item.walkable && !item.wall) {
      items.forEach((otherItem, idx) => {
        // ignore self
        if (idx === draggedItem) {
          return;
        }

        // ignore wall & floor
        if (otherItem.walkable || otherItem.wall) {
          return;
        }

        // check item overlap
        const otherWidth =
          otherItem.rotation === 1 || otherItem.rotation === 3
            ? otherItem.size[1]
            : otherItem.size[0];
        const otherHeight =
          otherItem.rotation === 1 || otherItem.rotation === 3
            ? otherItem.size[0]
            : otherItem.size[1];
        if (
          dragPosition[0] < otherItem.gridPosition[0] + otherWidth &&
          dragPosition[0] + width > otherItem.gridPosition[0] &&
          dragPosition[1] < otherItem.gridPosition[1] + otherHeight &&
          dragPosition[1] + height > otherItem.gridPosition[1]
        ) {
          droppable = false;
        }
      });
    }

    setCanDrop(droppable);
  }, [dragPosition, draggedItem, items, draggedItemRotation]);
  const controls = useRef();
  const state = useThree((state) => state);

  useEffect(() => {
    // console.log(items);
    if (buildMode) {
      setItems(map?.items || []);
      state.camera.position.set(8, 8, 8);
      controls.current.target.set(0, 0, 0);
    } else {
      socket.emit("itemsUpdate", items);
    }
  }, [buildMode]);

  useEffect(() => {
    if (shopMode) {
      state.camera.position.set(0, 4, 8);
      controls.current.target.set(0, 0, 0);
    } else {
      state.camera.position.set(8, 8, 8);
      controls.current.target.set(0, 0, 0);
    }
  }, [shopMode]);

  const onItemSelected = (item) => {
    setShopMode(false);

    setItems((prev) => [
      ...prev,
      {
        ...item,
        gridPosition: [0, 0],
        tmp: true,
        link: "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/640px-Flag_of_India.svg.png",
        by: accountId || "unknown",
      },
    ]);
    setDraggedItem(items.length);
    setDraggedItemRotation(0);
  };

  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.1} />
      <directionalLight
        position={[-4, 4, -4]}
        castShadow
        intensity={0.35}
        shadow-mapSize={[1024, 1024]}
      >
        <orthographicCamera
          attach={"shadow-camera"}
          args={[-(map?.size?.[0] || 15), (map?.size?.[1] || 15), 10, -10]}
          far={(map?.size?.[0] || 15) + (map?.size?.[1] || 15)}
        />
      </directionalLight>
      <OrbitControls
        ref={controls}
        minDistance={5}
        maxDistance={20}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        screenSpacePanning={false}
        enableZoom={!shopMode}
      />
      {shopMode && <Shop onItemSelected={onItemSelected} />}

      {!shopMode &&
        (buildMode ? items : map?.items || []).map((item, idx) => (
          <Item
            key={`${item.name}-${idx}`}
            item={item}
            onClick={(e) => {
              if (buildMode) {
                if (item.by == accountId) {
                  setDraggedItem((prev) => (prev === null ? idx : prev));
                  setDraggedItemRotation(item.rotation || 0);
                } else {
                  toast.error("Art does not belong to current user");
                  e.stopPropagation()
                }
              } else {
                if (item.name == "frame") {
                  console.log(item);
                  onFrameClick(item.id,item.price,item.likes,item.title,item.by);
                }
              }
            }}
            isDragging={draggedItem === idx}
            dragPosition={dragPosition}
            dragRotation={draggedItemRotation}
            canDrop={canDrop}
          />
        ))}

      {!shopMode && (
        <mesh
          rotation-x={-Math.PI / 2}
          position-y={-0.002}
          onClick={onPlaneClicked}
          onPointerEnter={() => setOnFloor(true)}
          onPointerLeave={() => setOnFloor(false)}
          onPointerMove={(e) => {
            if (!buildMode) {
              return;
            }
            const newPosition = vector3ToGrid(e.point);
            if (
              !dragPosition ||
              newPosition[0] !== dragPosition[0] ||
              newPosition[1] !== dragPosition[1]
            ) {
              setDragPosition(newPosition);
            }
          }}
          position-x={(map?.size?.[0] || 15) / 2}
          position-z={(map?.size?.[1] || 15) / 2}
          receiveShadow
        >
          <planeGeometry args={map?.size || [15, 15]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
      )}
      {buildMode && !shopMode && (
        <Grid infiniteGrid fadeDistance={50} fadeStrength={5} />
      )}
      {!buildMode &&
        characters.map((character) => (
          <Suspense key={character.id}>
            <Avatar
              id={character.id}
              position={gridToVector3(character.position)}
              hairColor={character.hairColor}
              topColor={character.topColor}
              bottomColor={character.bottomColor}
              avatarUrl={character.avatarUrl}
            />
          </Suspense>
        ))}
    </>
  );
};
