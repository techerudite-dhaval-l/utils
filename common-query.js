// you need to replace - query_name_ & QueryName_ accross this function

const QUERY_NAME = gql`QUERY_PLACEHOLDER`;

export const QueryName_Action = () => {
    const [queryFn, query_name_Status] = useLazyQuery(QUERY_NAME, {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-and-network',
    });

    const initQueryName_ = (data, successCallBack, errorCallback) => {
        queryFn({
            variables: data,
        })
            .then((res) => {
                const resData = res.data.query_name_;
                if (resData.success) successCallBack && successCallBack(resData.data);
                else errorCallback && errorCallback(resData);
            })
            .catch((error) => {
                errorCallback && errorCallback(error);
            });
    };

    return { query_name_Status, initQueryName_ };
};
