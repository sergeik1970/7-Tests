// import React, { ReactElement, createRef, useEffect, useRef, useState } from "react";
// import Button from "@/shared/components/Button";
// import { useDispatch } from "@/shared/store/store";
// import { getDeals, addDeal } from "@/shared/store/slices/deals/thunks";
// import DealsList from "./components/DealsList";
// import InputText from "@/shared/components/InputText";
// import styles from "./index.module.scss";

// const Deals = (): ReactElement => {
//     const dispatch = useDispatch();
//     const [value, setValue] = useState("");
//     const inputRef = createRef<HTMLInputElement>();

//     const click = () => {
//         if (value) dispatch(addDeal({ name: value }));
//         if (inputRef.current) inputRef.current.value = "";
//     };

//     const change = (e: any) => {
//         setValue(e.target.value);
//     };

//     useEffect(() => {
//         dispatch(getDeals());
//     }, []);

//     return (
//         <div>
//             <div className={styles["wrap"]}>
//                 <InputText className={styles["input"]} ref={inputRef} onChange={change} />
//                 <Button onClick={click}>add deal</Button>
//             </div>
//             <DealsList />
//         </div>
//     );
// };

// export default Deals;
