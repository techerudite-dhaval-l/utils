// you need to replace - mutation_name_ & MutationName_ accross this function

const __MUTATION_NAME = gql`MUTATION_PLACEHOLDER`;

export const MutationName_Action = () => {
    const [mutateFn, mutation_name_Status] = useMutation(__MUTATION_NAME);

    const initMutationName_ = (data, successCallback, errorCallback) => {
        mutateFn({
            variables: data,
        })
            .then((responseData) => {
                // console.log('mutation_name_--responseData', responseData)
                const resData = responseData.data.mutation_name_;
                if (resData.success) {
                    successCallback && successCallback(resData.data);
                } else {
                    errorCallback && errorCallback(responseData);
                }
            })
            .catch((err) => {
                errorCallback && errorCallback(err);
            });
    };

    return { mutation_name_Status, initMutationName_ };
};
