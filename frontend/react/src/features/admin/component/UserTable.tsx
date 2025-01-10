import { Box, Pagination, styled, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { ChangeEvent, FC, useMemo, useState } from "react";
import { useQueryIds } from "../api/information.api";

type Props = {
  refetch: boolean
}

const UserTable: FC<Props> = ({refetch}) => {
  const [page, setPage] = useState(1);
  const { data } = useQueryIds({page}, { refetchInterval: 5000, enabled: refetch});

  const onChangePage = (_event: ChangeEvent<unknown>, val: number) => setPage(val);

  const list = useMemo(() => {
    if (!data) return undefined;
    return <TableBody>
      {data.list.map(({id, sid, lastAccessTime}) => <TableRow key={id}>
        <TableCell>{id}</TableCell>
        <TableCell>{sid}</TableCell>
        <TableCell align="right">{lastAccessTime.toLocaleString('ko')}</TableCell>
      </TableRow>)}
    </TableBody>
  }, [data])

  return <StyledUserTable> 
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>SID</TableCell>
          <TableCell align="right" >마지막 접근 시간</TableCell>
        </TableRow>
      </TableHead>
      {list}
    </Table>
    <Pagination count={5} page={page} onChange={onChangePage}/>
  </StyledUserTable>
}

const StyledUserTable = styled(Box)(({theme}) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  '& > .MuiPagination-root': {
    marginTop: theme.spacing(2)
  }
}))

export default UserTable;