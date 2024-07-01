// you need to replace - mutation_name_ & MutationName accross this function

const MUTATION_NAME = gql`MUTATION_PLACEHOLDER`;

export const MutationNameAction = () => {
    const [mutateFn, mutation_name_Status] = useMutation(MUTATION_NAME);

    const initMutationName = (data, successCallback, errorCallback) => {
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

    return { mutation_name_Status, initMutationName };
};
